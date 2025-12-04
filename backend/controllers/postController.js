const Post = require('../models/Post');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail } = require('../services/emailService');

// @desc    Create new SOS post
// @route   POST /api/posts
// @access  Private (User)
const createPost = async (req, res) => {
    try {
        const { type, textContent, city, state } = req.body;
        let content = textContent;

        if (req.file) {
            content = req.file.location; // S3 URL
        }

        // 1. Create Post
        const post = await Post.create({
            userId: req.user._id,
            type,
            content,
            city,
            state
        });

        // 2. Call ML Service (Mock)
        // In production, use axios/fetch to call external ML API
        // const mlResponse = await axios.post(process.env.ML_SERVICE_URL, { content });
        // const dangerScore = mlResponse.data.danger_score;

        // Mocking ML response
        const dangerScore = Math.floor(Math.random() * 100); // Random 0-100
        const mlResponse = { danger_score: dangerScore, tags: ['simulated'] };

        // 3. Update Post
        post.dangerLevel = dangerScore;
        post.mlResponse = mlResponse;
        await post.save();

        // 4. Check Threshold & Alert
        if (dangerScore > 50) {
            // Create Alert
            const alert = await Alert.create({
                postId: post._id,
                targetCity: city,
                targetState: state,
                targetRole: 'admin' // Generic target, handled by room logic
            });

            // Find Admins to notify
            const admins = await User.find({
                $or: [
                    { role: 'central_admin' },
                    { role: 'state_admin', state: state },
                    { role: 'city_admin', city: city }
                ]
            });

            const adminEmails = admins.map(a => a.email);

            // Send Email
            if (adminEmails.length > 0) {
                sendAlertEmail(adminEmails, `URGENT: High Danger SOS in ${city}`, `Danger Level: ${dangerScore}. Post ID: ${post._id}`);
            }

            // Socket Emit
            const io = req.app.get('io');
            if (io) {
                const alertPayload = {
                    alertId: alert._id,
                    postId: post._id,
                    dangerLevel: dangerScore,
                    city,
                    state,
                    message: "High Danger SOS Reported!"
                };

                io.to('central_admin').emit('new_alert', alertPayload);
                io.to(`state_${state}`).emit('new_alert', alertPayload);
                io.to(`city_${city}`).emit('new_alert', alertPayload);
            }
        }

        res.status(201).json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my posts
// @route   GET /api/posts/my
// @access  Private
const getMyPosts = async (req, res) => {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
    const post = await Post.findById(req.params.id).populate('userId', 'name phone');
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
};

// @desc    Add Review
// @route   PUT /api/posts/:id/review
// @access  Private (User)
const addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (post.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed posts' });
        }

        post.review = { rating, comment };
        await post.save();
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
};

// @desc    Handle ML Callback
// @route   POST /api/posts/ml-callback
// @access  Public (Should be secured in prod)
const handleMLCallback = async (req, res) => {
    const { postId, danger_score, tags } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.dangerLevel = danger_score;
        post.mlResponse = { danger_score, tags };
        await post.save();

        // Check Threshold & Alert
        if (danger_score > 50) {
            // Create Alert
            const alert = await Alert.create({
                postId: post._id,
                targetCity: post.city,
                targetState: post.state,
                targetRole: 'admin'
            });

            // Find Admins to notify
            const admins = await User.find({
                $or: [
                    { role: 'central_admin' },
                    { role: 'state_admin', state: post.state },
                    { role: 'city_admin', city: post.city }
                ]
            });

            const adminEmails = admins.map(a => a.email);

            // Send Email
            if (adminEmails.length > 0) {
                sendAlertEmail(adminEmails, `URGENT: High Danger SOS in ${post.city}`, `Danger Level: ${danger_score}. Post ID: ${post._id}`);
            }

            // Socket Emit
            const io = req.app.get('io');
            if (io) {
                const alertPayload = {
                    alertId: alert._id,
                    postId: post._id,
                    dangerLevel: danger_score,
                    city: post.city,
                    state: post.state,
                    message: "High Danger SOS Reported!"
                };

                io.to('central_admin').emit('new_alert', alertPayload);
                io.to(`state_${post.state}`).emit('new_alert', alertPayload);
                io.to(`city_${post.city}`).emit('new_alert', alertPayload);
            }
        }

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createPost, getMyPosts, getPostById, addReview, handleMLCallback };
