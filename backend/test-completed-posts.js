// Test script to verify completed posts endpoint
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function testCompletedPosts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get central admin user
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const admin = await User.findOne({ email: 'nikhilsethin494@gmail.com' });

        if (!admin) {
            console.log('❌ Central admin not found');
            return;
        }

        console.log('✅ Found admin:', admin.name, `(${admin.role})`);

        // Generate a token (simplified - in reality this would use JWT)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { _id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('\n📊 Testing /api/admin/completed-posts endpoint...\n');

        // Test the endpoint
        const response = await axios.get('http://localhost:5001/api/admin/completed-posts', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                page: 1,
                limit: 10
            }
        });

        console.log('✅ API Response:');
        console.log('   Total Posts:', response.data.pagination.totalPosts);
        console.log('   Current Page:', response.data.pagination.currentPage);
        console.log('   Total Pages:', response.data.pagination.totalPages);
        console.log('   Posts on this page:', response.data.posts.length);

        if (response.data.posts.length > 0) {
            console.log('\n📋 Sample Post:');
            const post = response.data.posts[0];
            console.log('   ID:', post._id);
            console.log('   City:', post.city);
            console.log('   State:', post.state);
            console.log('   Danger Level:', post.dangerLevel);
            console.log('   Status:', post.status);
            console.log('   Content:', post.content.substring(0, 100) + '...');
        } else {
            console.log('\n⚠️  No completed posts found in database');
            console.log('   This is why the News Admin Dashboard shows "No completed reports found"');
            console.log('\n💡 To test the feature:');
            console.log('   1. Create some SOS posts from the user frontend');
            console.log('   2. Mark them as "completed" from the admin dashboard');
            console.log('   3. Then they will appear in the News Admin Dashboard');
        }

        await mongoose.disconnect();

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.response?.data) {
            console.error('   Response:', err.response.data);
        }
    }
}

testCompletedPosts();
