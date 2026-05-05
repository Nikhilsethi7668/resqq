// Quick test script to verify the completed-posts endpoint
const axios = require('axios');

async function testCompletedPostsEndpoint() {
    try {
        console.log('🧪 Testing News Admin Dashboard API...\n');

        // First, login as news admin
        console.log('1️⃣ Logging in as news admin...');
        const loginResponse = await axios.post('http://45.137.194.145:5001/api/auth/login', {
            email: 'newsadmin@test.com',  // From seed-test-data.js
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('   Token:', token.substring(0, 20) + '...');
        console.log('   User:', loginResponse.data.name);
        console.log('   Role:', loginResponse.data.role);

        // Now fetch completed posts
        console.log('\n2️⃣ Fetching completed posts...');
        const postsResponse = await axios.get('http://45.137.194.145:5001/api/admin/completed-posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                page: 1,
                limit: 10
            }
        });

        console.log('✅ API Response received');
        console.log('   Status:', postsResponse.status);
        console.log('   Total Posts:', postsResponse.data.pagination?.totalPosts || 0);
        console.log('   Posts on Page:', postsResponse.data.posts?.length || 0);

        if (postsResponse.data.posts && postsResponse.data.posts.length > 0) {
            console.log('\n📋 Sample Post:');
            const post = postsResponse.data.posts[0];
            console.log('   ID:', post._id);
            console.log('   City:', post.city);
            console.log('   State:', post.state);
            console.log('   Status:', post.status);
            console.log('   Danger Level:', post.dangerLevel);
            console.log('   Type:', post.type);
        } else {
            console.log('\n⚠️  No posts returned!');
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during test:');
        console.error('   Message:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testCompletedPostsEndpoint();
