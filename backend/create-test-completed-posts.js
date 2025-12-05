// Test script to create a completed post for News Admin Dashboard testing
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const Post = require('./models/Post');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

const createTestCompletedPost = async () => {
    try {
        await connectDB();

        // Find a test user or use null for guest
        const testUser = await User.findOne({ role: 'user' });

        // Create a completed test post
        const testPost = await Post.create({
            userId: testUser?._id || null,
            type: 'text',
            content: 'Test emergency: Major flood in Mumbai area. Water level rising rapidly. Need immediate assistance.',
            city: 'Mumbai',
            state: 'Maharashtra',
            latitude: 19.0760,
            longitude: 72.8777,
            status: 'completed',
            dangerLevel: 85,
            mlResponse: {
                disaster_type: 'Flood',
                danger_score: 85,
                confidence: 0.92,
                tags: ['flood', 'urgent', 'water']
            },
            helpDetails: {
                situation: 'Emergency services deployed. Evacuation in progress. Rescue teams on site.',
                timestamp: new Date()
            }
        });

        console.log('✅ Test completed post created:');
        console.log('   ID:', testPost._id);
        console.log('   City:', testPost.city);
        console.log('   State:', testPost.state);
        console.log('   Status:', testPost.status);
        console.log('   Danger Level:', testPost.dangerLevel);

        // Create a few more for testing
        const cities = [
            { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
            { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
            { city: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 }
        ];

        for (const location of cities) {
            await Post.create({
                userId: testUser?._id || null,
                type: 'text',
                content: `Emergency situation in ${location.city}. Immediate response required.`,
                city: location.city,
                state: location.state,
                latitude: location.lat,
                longitude: location.lon,
                status: 'completed',
                dangerLevel: Math.floor(Math.random() * 40) + 60, // 60-100
                mlResponse: {
                    disaster_type: 'Emergency',
                    danger_score: Math.floor(Math.random() * 40) + 60,
                    confidence: 0.85,
                    tags: ['emergency', 'urgent']
                },
                helpDetails: {
                    situation: 'Situation resolved successfully.',
                    timestamp: new Date()
                }
            });
        }

        console.log(`✅ Created ${cities.length} additional test posts`);
        console.log('\n📊 Total completed posts in database:');

        const count = await Post.countDocuments({ status: 'completed' });
        console.log(`   ${count} completed posts`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating test post:', err);
        process.exit(1);
    }
};

createTestCompletedPost();
