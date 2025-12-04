const Post = require('../models/Post');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendAlertEmail, createAlertEmailHTML } = require('../services/emailService');
const axios = require('axios');
const FormData = require('form-data');

// @desc    Create new SOS post
// @route   POST /api/posts
// @access  Private (User)
const createPost = async (req, res) => {
    try {
        const { type, textContent, city, state } = req.body;
        let content = textContent;

        if (req.file) {
            // Check if S3 (location) or Local (filename)
            if (req.file.location) {
                content = req.file.location;
            } else {
                // Construct local URL
                content = `${process.env.BACKEND_URL || 'http://localhost:5001'}/uploads/${req.file.filename}`;
            }
        }

        // 1. Create Post
        const post = await Post.create({
            userId: req.user ? req.user._id : null,
            type,
            content,
            city,
            state
        });

        // 2. Call ML Service for real prediction
        let dangerScore = 70; // Default fallback
        let mlResponse = { danger_score: 70, tags: ['pending_ml'] };

        try {
            const fs = require('fs'); // fs is only needed here for local files

            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5002/predict';
            console.log('🤖 Calling ML Service:', mlServiceUrl);
            console.log('📝 Content Type:', type);

            if (type === 'text') {
                console.log('📄 Text Content:', textContent);
                // Send text to ML service
                const response = await axios.post(mlServiceUrl,
                    new URLSearchParams({
                        type: 'text',
                        text: textContent
                    }),
                    {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        timeout: 10000
                    }
                );

                console.log('✅ ML Response:', response.data);
                dangerScore = response.data.danger_score || 70;
                mlResponse = response.data;

            } else if (type === 'image' || type === 'audio') {
                console.log('📁 Media file detected');
                // For media files, send the file to ML service
                const formData = new FormData();
                formData.append('type', type);

                // Check if file is local or S3
                if (req.file && req.file.path) {
                    // Local file
                    console.log('💾 Local file:', req.file.path);
                    formData.append('file', fs.createReadStream(req.file.path));
                } else if (req.file && req.file.location) {
                    // S3 file - download and send
                    console.log('☁️ S3 file:', req.file.location);
                    const fileResponse = await axios.get(req.file.location, { responseType: 'arraybuffer' });
                    formData.append('file', Buffer.from(fileResponse.data), {
                        filename: req.file.originalname || 'file',
                        contentType: req.file.mimetype
                    });
                }

                const response = await axios.post(mlServiceUrl, formData, {
                    headers: formData.getHeaders(),
                    timeout: 15000
                });

                console.log('✅ ML Response:', response.data);
                dangerScore = response.data.danger_score || 70;
                mlResponse = response.data;
            }

            console.log('🎯 Final Danger Score:', dangerScore);

        } catch (mlError) {
            console.error('❌ ML Service Error:', mlError.message);
            console.error('Stack:', mlError.stack);
            // Fallback to keyword-based scoring if ML service fails
            if (type === 'text' && textContent) {
                const urgentKeywords = ['fire', 'flood', 'earthquake', 'collapse', 'emergency', 'urgent', 'help'];
                const hasUrgent = urgentKeywords.some(keyword => textContent.toLowerCase().includes(keyword));
                dangerScore = hasUrgent ? 85 : 65;
                mlResponse = { danger_score: dangerScore, tags: ['fallback', 'keyword'], error: mlError.message };
                console.log('⚠️ Using fallback score:', dangerScore);
            }
        }

        // 3. Update Post with ML results
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

            // TESTING MODE: Send all emails only to nikhilsethin494@gmail.com
            // This prevents errors from non-existent admin emails
            const testEmail = 'nikhilsethin494@gmail.com';
            console.log(`📧 Alert triggered! Sending email to: ${testEmail}`);
            console.log(`   (Would have sent to ${adminEmails.length} admins: ${adminEmails.join(', ')})`);

            // Send Email with detailed alert information
            const emailHTML = createAlertEmailHTML({
                city: city,
                state: state,
                dangerLevel: dangerScore,
                postId: post._id,
                content: textContent || content,
                type: type,
                timestamp: new Date().toLocaleString()
            });

            await sendAlertEmail(
                [testEmail],  // Only send to this email for testing
                `🚨 URGENT: High Danger SOS in ${city}, ${state}`,
                emailHTML
            );


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

                console.log('🔔 Emitting socket alerts...');
                console.log(`   Alert Payload:`, JSON.stringify(alertPayload, null, 2));

                io.to('central_admin').emit('new_alert', alertPayload);
                console.log(`   ✅ Emitted to: central_admin`);

                io.to(`state_${state}`).emit('new_alert', alertPayload);
                console.log(`   ✅ Emitted to: state_${state}`);

                io.to(`city_${city}`).emit('new_alert', alertPayload);
                console.log(`   ✅ Emitted to: city_${city}`);

                console.log(`   📊 Total connected sockets: ${io.sockets.sockets.size}`);
            } else {
                console.log('   ❌ Socket.io not available!');
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

            // TESTING MODE: Send all emails only to nikhilsethin494@gmail.com
            const testEmail = 'nikhilsethin494@gmail.com';
            console.log(`📧 Alert triggered! Sending email to: ${testEmail}`);
            console.log(`   (Would have sent to ${adminEmails.length} admins: ${adminEmails.join(', ')})`);

            // Send Email with detailed alert information
            const emailHTML = createAlertEmailHTML({
                city: post.city,
                state: post.state,
                dangerLevel: danger_score,
                postId: post._id,
                content: post.content,
                type: post.type,
                timestamp: new Date().toLocaleString()
            });

            await sendAlertEmail(
                [testEmail],  // Only send to this email for testing
                `🚨 URGENT: High Danger SOS in ${post.city}, ${post.state}`,
                emailHTML
            );

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

// @desc    Delete Post
// @route   DELETE /api/posts/:id
// @access  Private (Admin)
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Delete associated alerts
        await Alert.deleteMany({ postId: post._id });

        // Delete post
        await post.deleteOne();

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createPost, getMyPosts, getPostById, addReview, handleMLCallback, deletePost };
