// Complete end-to-end test for alert system
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL || 'http://45.137.194.145:5000';

console.log('🧪 Complete Alert System Test\n');
console.log('='.repeat(70));

async function testAlertSystem() {
    try {
        // Step 1: Register a test user
        console.log('\n1️⃣ Creating test user...');
        const testUserEmail = `testuser_${Date.now()}@test.com`;

        const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
            name: 'Test User',
            email: testUserEmail,
            password: 'password123',
            phone: '1234567890',
            city: 'Los Angeles',
            state: 'California'
        });

        const userToken = registerRes.data.token;
        console.log('✅ Test user created');
        console.log(`   Email: ${testUserEmail}`);
        console.log(`   Token: ${userToken.substring(0, 20)}...`);

        // Step 2: Create high-danger SOS
        console.log('\n2️⃣ Creating HIGH-DANGER SOS...');
        console.log('   Content: "FIRE! URGENT! Building collapse! HELP!"');
        console.log('   City: Los Angeles');
        console.log('   State: California');

        const postRes = await axios.post(
            `${API_URL}/api/posts`,
            {
                type: 'text',
                textContent: 'FIRE! URGENT! Building collapse on Main Street! Multiple people trapped! HELP NEEDED IMMEDIATELY! Smoke everywhere!',
                city: 'Los Angeles',
                state: 'California'
            },
            {
                headers: { Authorization: `Bearer ${userToken}` }
            }
        );

        console.log('\n✅ SOS POST CREATED!');
        console.log('   Post ID:', postRes.data._id);
        console.log('   Danger Level:', postRes.data.dangerLevel);
        console.log('   Status:', postRes.data.status);
        console.log('   ML Response:', JSON.stringify(postRes.data.mlResponse, null, 2));

        if (postRes.data.dangerLevel > 50) {
            console.log('\n🎯 DANGER LEVEL > 50! Alerts should be triggered!');
            console.log('\n📋 What should happen now:');
            console.log('   ✅ Email sent to: nikhilsethin494@gmail.com');
            console.log('   ✅ Socket alert emitted to: central_admin');
            console.log('   ✅ Socket alert emitted to: state_California');
            console.log('   ✅ Socket alert emitted to: city_Los Angeles');
            console.log('\n🔍 CHECK YOUR BACKEND TERMINAL FOR:');
            console.log('   - "📧 Alert triggered! Sending email to: nikhilsethin494@gmail.com"');
            console.log('   - "✅ Email sent successfully!"');
            console.log('   - "🔔 Emitting socket alerts..."');
            console.log('   - "✅ Emitted to: central_admin"');
            console.log('   - "✅ Emitted to: state_California"');
            console.log('   - "✅ Emitted to: city_Los Angeles"');
            console.log('\n📬 CHECK YOUR EMAIL:');
            console.log('   - Inbox: nikhilsethin494@gmail.com');
            console.log('   - Subject: 🚨 URGENT: High Danger SOS in Los Angeles, California');
            console.log('   - Check spam folder too!');
            console.log('\n🖥️  CHECK ADMIN DASHBOARD:');
            console.log('   - Red blinking screen should appear');
            console.log('   - Alert message should show');
            console.log('   - Open browser console (F12) to see socket messages');
        } else {
            console.log(`\n⚠️  Danger level is only ${postRes.data.dangerLevel}`);
            console.log('   Need > 50 for alerts to trigger');
            console.log('   Try creating another SOS with more urgent keywords');
        }

        console.log('\n' + '='.repeat(70));
        console.log('TEST COMPLETE!');
        console.log('='.repeat(70));

    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
        if (err.response?.data) {
            console.error('Response:', JSON.stringify(err.response.data, null, 2));
        }
        console.error('\nStack:', err.stack);
    }
}

testAlertSystem();
