const Post = require('../models/Post');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail } = require('../services/emailService');

// @desc    Get Alerts with pagination and filtering
// @route   GET /api/admin/alerts
// @access  Private (Admin)
const getAlerts = async (req, res) => {
    try {
        const { page = 1, limit = 10, state, city, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Filter based on role
        let filter = { isActive: true };

        if (req.user.role === 'city_admin') {
            filter.targetCity = req.user.city;
            filter.targetState = req.user.state;
        } else if (req.user.role === 'state_admin') {
            filter.targetState = req.user.state;
            // State admin can filter by city within their state
            if (city) {
                filter.targetCity = city;
            }
        } else if (req.user.role === 'central_admin') {
            // Central admin can filter by state and city
            if (state) {
                filter.targetState = state;
            }
            if (city) {
                filter.targetCity = city;
            }
        } else if (req.user.role === 'news_admin') {
            // News admin can see all but typically won't use this endpoint
            if (state) {
                filter.targetState = state;
            }
            if (city) {
                filter.targetCity = city;
            }
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'desc' ? -1 : 1;

        // Get total count
        const total = await Alert.countDocuments(filter);

        // Get alerts with pagination
        const alerts = await Alert.find(filter)
            .populate('postId')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            alerts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalAlerts: total,
                alertsPerPage: parseInt(limit),
                hasNextPage: skip + alerts.length < total,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (err) {
        console.error('Error fetching alerts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Acknowledge Alert
// @route   POST /api/admin/alerts/:id/acknowledge
// @access  Private (Admin)
const acknowledgeAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Add admin to acknowledgedBy array if not already present
        if (!alert.acknowledgedBy.includes(req.user._id)) {
            alert.acknowledgedBy.push(req.user._id);
            await alert.save();
        }

        res.json({ message: 'Alert acknowledged', alert });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update Post Status
// @route   POST /api/admin/posts/:id/status
// @access  Private (Admin)
const updatePostStatus = async (req, res) => {
    const { status, helpDetails } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    // Authorization check for completion
    if (status === 'completed') {
        if (req.user.role !== 'central_admin') {
            return res.status(403).json({ message: 'Only central admin can mark as completed' });
        }
    }

    post.status = status;
    if (status === 'investigating') {
        post.assignedTo = req.user._id;
    }
    if (status === 'help_sent') {
        post.helpDetails = {
            situation: helpDetails.situation,
            timestamp: new Date()
        };

        // Notify User via Email
        const user = await User.findById(post.userId);
        if (user) {
            sendAlertEmail(
                [user.email],
                'Help is on the way!',
                `Your emergency report has been addressed. Help details: ${helpDetails.situation}`
            );
        }
    }

    if (status === 'completed') {
        // Deactivate related alerts
        await Alert.updateMany({ postId: post._id }, { isActive: false });
    }

    await post.save();

    // Emit update
    const io = req.app.get('io');
    io.emit('post_update', { postId: post._id, status });

    res.json(post);
};

// @desc    Broadcast Alert
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastAlert = async (req, res) => {
    const { message, level, targetCity, targetState } = req.body;

    const io = req.app.get('io');
    let targetAdmins = [];

    if (req.user.role === 'city_admin') {
        // City admin can only broadcast to their city
        io.to(`city_${req.user.city}`).emit('broadcast_msg', {
            message,
            level,
            from: `${req.user.city} City Admin`
        });

        targetAdmins = await User.find({
            role: 'city_admin',
            city: req.user.city
        });

    } else if (req.user.role === 'state_admin') {
        // State admin can broadcast to entire state (all cities in state)
        io.to(`state_${req.user.state}`).emit('broadcast_msg', {
            message,
            level,
            from: `${req.user.state} State Admin`
        });

        // Also send to all city admins in the state
        const cities = await User.distinct('city', {
            role: 'city_admin',
            state: req.user.state
        });

        cities.forEach(city => {
            io.to(`city_${city}`).emit('broadcast_msg', {
                message,
                level,
                from: `${req.user.state} State Admin`
            });
        });

        targetAdmins = await User.find({
            $or: [
                { role: 'state_admin', state: req.user.state },
                { role: 'city_admin', state: req.user.state }
            ]
        });

    } else if (req.user.role === 'central_admin') {
        // Central admin broadcasts to everyone
        io.emit('broadcast_msg', {
            message,
            level,
            from: 'Central Admin'
        });

        targetAdmins = await User.find({
            role: { $in: ['city_admin', 'state_admin', 'central_admin'] }
        });
    }

    // Send emails to all target admins
    if (targetAdmins.length > 0) {
        const emails = targetAdmins.map(admin => admin.email);
        sendAlertEmail(emails, `BROADCAST: ${level}`, message);
    }

    res.json({ message: 'Broadcast sent', recipientCount: targetAdmins.length });
};

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

// @desc    Create new admin
// @route   POST /api/admin/users/create
// @access  Private (Central Admin, State Admin)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, role, city, state, aadhar } = req.body;

        // Validation: Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Authorization: Check if current user can create this role
        if (req.user.role === 'central_admin') {
            // Central admin can create: state_admin, central_admin, news_admin, city_admin
            if (!['state_admin', 'central_admin', 'news_admin', 'city_admin'].includes(role)) {
                return res.status(403).json({
                    message: 'Central admin can only create State Admin, City Admin, Central Admin, or News Admin'
                });
            }
        } else if (req.user.role === 'state_admin') {
            // State admin can only create city_admin
            if (role !== 'city_admin') {
                return res.status(403).json({
                    message: 'State admin can only create City Admin'
                });
            }
            // State admin can only create admins in their own state
            if (state !== req.user.state) {
                return res.status(403).json({
                    message: 'You can only create admins in your own state'
                });
            }
        } else {
            return res.status(403).json({ message: 'Not authorized to create admins' });
        }

        // Validation: Check required fields based on role
        if (role === 'city_admin' && (!city || !state)) {
            return res.status(400).json({ message: 'City and State are required for City Admin' });
        }
        if (role === 'state_admin' && !state) {
            return res.status(400).json({ message: 'State is required for State Admin' });
        }

        // Create new admin
        const newAdmin = await User.create({
            name,
            email,
            password,
            phone,
            role,
            city: city || null,
            state: state || null,
            aadhar: aadhar || null,
            createdBy: req.user._id,
            isActive: true
        });

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                _id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                city: newAdmin.city,
                state: newAdmin.state,
                createdBy: newAdmin.createdBy,
                isActive: newAdmin.isActive
            }
        });
    } catch (err) {
        console.error('Create admin error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get admins created by current user
// @route   GET /api/admin/users
// @access  Private (Central Admin, State Admin)
const getAdmins = async (req, res) => {
    try {
        let filter = { role: { $ne: 'user' } }; // Exclude regular users

        if (req.user.role === 'central_admin') {
            // Central admin sees all admins they created
            filter.createdBy = req.user._id;
        } else if (req.user.role === 'state_admin') {
            // State admin sees city admins in their state that they created
            filter.createdBy = req.user._id;
            filter.state = req.user.state;
            filter.role = 'city_admin';
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const admins = await User.find(filter)
            .select('-password')
            .populate('createdBy', 'name email role')
            .populate('deactivatedBy', 'name email role')
            .sort({ createdAt: -1 });

        res.json(admins);
    } catch (err) {
        console.error('Get admins error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get admin details
// @route   GET /api/admin/users/:id
// @access  Private (Central Admin, State Admin)
const getAdminDetails = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'name email role')
            .populate('deactivatedBy', 'name email role');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Authorization check: can only view admins they created
        if (req.user.role === 'state_admin') {
            if (admin.createdBy?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this admin' });
            }
        } else if (req.user.role === 'central_admin') {
            if (admin.createdBy?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this admin' });
            }
        }

        res.json(admin);
    } catch (err) {
        console.error('Get admin details error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Deactivate admin (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private (Central Admin, State Admin)
const deactivateAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Cannot deactivate regular users
        if (admin.role === 'user') {
            return res.status(400).json({ message: 'Cannot deactivate regular users through this endpoint' });
        }

        // Authorization: Can only deactivate admins you created
        if (admin.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only deactivate admins that you created'
            });
        }

        // Already deactivated
        if (!admin.isActive) {
            return res.status(400).json({ message: 'Admin is already deactivated' });
        }

        // Soft delete
        admin.isActive = false;
        admin.deactivatedBy = req.user._id;
        admin.deactivatedAt = new Date();
        await admin.save();

        res.json({
            message: 'Admin deactivated successfully',
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                deactivatedAt: admin.deactivatedAt
            }
        });
    } catch (err) {
        console.error('Deactivate admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update admin details
// @route   PUT /api/admin/users/:id
// @access  Private (Central Admin, State Admin)
const updateAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Authorization: Can only update admins you created
        if (admin.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only update admins that you created'
            });
        }

        // Only allow updating specific fields
        const { name, phone, email } = req.body;

        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (email) {
            // Check if email is already taken
            const emailExists = await User.findOne({ email, _id: { $ne: admin._id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            admin.email = email;
        }

        await admin.save();

        res.json({
            message: 'Admin updated successfully',
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role
            }
        });
    } catch (err) {
        console.error('Update admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Get Completed Posts (for News Admin to convert to news)
// @route   GET /api/admin/completed-posts
// @access  Private (Central Admin, News Admin, State Admin)
const getCompletedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, state, city, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Build filter based on role
        let filter = { status: 'completed' };

        if (req.user.role === 'state_admin') {
            // State admin can only see completed posts from their state
            filter.state = req.user.state;
        } else if (req.user.role === 'city_admin') {
            // City admin can only see completed posts from their city
            filter.city = req.user.city;
            filter.state = req.user.state;
        }
        // Central admin and news admin can see all completed posts

        // Apply additional filters from query params
        if (state && (req.user.role === 'central_admin' || req.user.role === 'news_admin')) {
            filter.state = state;
        }
        if (city && (req.user.role === 'central_admin' || req.user.role === 'news_admin' || req.user.role === 'state_admin')) {
            filter.city = city;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'desc' ? -1 : 1;

        // Get total count for pagination
        const total = await Post.countDocuments(filter);

        // Get posts with pagination and sorting
        const posts = await Post.find(filter)
            .populate('userId', 'name phone email')
            .populate('assignedAdmin', 'name role')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalPosts: total,
                postsPerPage: parseInt(limit),
                hasNextPage: skip + posts.length < total,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (err) {
        console.error('Error fetching completed posts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAlerts,
    acknowledgeAlert,
    updatePostStatus,
    broadcastAlert,
    // Admin Management
    createAdmin,
    getAdmins,
    getAdminDetails,
    deactivateAdmin,
    updateAdmin,
    // Completed Posts for News
    getCompletedPosts
};
