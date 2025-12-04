const Post = require('../models/Post');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail } = require('../services/emailService');

// @desc    Get Alerts
// @route   GET /api/admin/alerts
// @access  Private (Admin)
const getAlerts = async (req, res) => {
    // Filter based on role
    let filter = {};
    if (req.user.role === 'city_admin') {
        filter = { targetCity: req.user.city, isActive: true };
    } else if (req.user.role === 'state_admin') {
        filter = { targetState: req.user.state, isActive: true };
    } else if (req.user.role === 'central_admin') {
        filter = { isActive: true }; // All active alerts
    } else {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const alerts = await Alert.find(filter).populate('postId').sort({ createdAt: -1 });
    res.json(alerts);
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

module.exports = { getAlerts, acknowledgeAlert, updatePostStatus, broadcastAlert };
