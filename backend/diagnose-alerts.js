// Comprehensive diagnostic script for ResQQ alert system
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL || 'http://45.137.194.145:5000';

console.log('🔍 ResQQ Alert System Diagnostic\n');
console.log('='.repeat(60));

async function runDiagnostics() {
    try {
        // Test 1: Check backend is running
        console.log('\n1️⃣ Testing Backend Connection...');
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                validateStatus: () => true
            });
            if (response.status === 401) {
                console.log('   ✅ Backend is running (got expected 401 for unauthorized)');
            } else {
                console.log(`   ⚠️  Backend responded with status: ${response.status}`);
            }
        } catch (err) {
            console.log(`   ❌ Backend not reachable: ${err.message}`);
            console.log(`   💡 Make sure backend is running on ${API_URL}`);
            return;
        }

        // Test 2: Connect to MongoDB and check for central admin
        console.log('\n2️⃣ Checking Database for Central Admin...');
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('   ✅ Connected to MongoDB');

            const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
            const centralAdmin = await User.findOne({
                email: 'nikhilsethin494@gmail.com'
            });

            if (centralAdmin) {
                console.log('   ✅ Central admin found:');
                console.log(`      Email: ${centralAdmin.email}`);
                console.log(`      Role: ${centralAdmin.role}`);
                console.log(`      Active: ${centralAdmin.isActive}`);

                if (centralAdmin.role !== 'central_admin') {
                    console.log('   ❌ ERROR: Role is not "central_admin"!');
                    console.log('   💡 Update role in MongoDB to "central_admin"');
                }
                if (!centralAdmin.isActive) {
                    console.log('   ❌ ERROR: Account is not active!');
                }
            } else {
                console.log('   ❌ No user found with email: nikhilsethin494@gmail.com');
                console.log('   💡 Create a central admin account first');
            }
        } catch (err) {
            console.log(`   ❌ Database error: ${err.message}`);
        }

        // Test 3: Check email configuration
        console.log('\n3️⃣ Checking Email Configuration...');
        if (process.env.mail_resend_key) {
            const keyPreview = process.env.mail_resend_key.substring(0, 8) + '...';
            console.log(`   ✅ Resend API key found: ${keyPreview}`);
        } else {
            console.log('   ❌ Resend API key NOT found in .env');
            console.log('   💡 Add mail_resend_key to your .env file');
        }

        // Test 4: Create a test SOS post
        console.log('\n4️⃣ Creating Test SOS Post...');
        console.log('   (This will trigger alerts if danger level > 50)');

        // First, register a test user
        const testUserEmail = `testuser_${Date.now()}@test.com`;
        let testUserToken = '';

        try {
            const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
                name: 'Test User',
                email: testUserEmail,
                password: 'password123',
                phone: '1234567890',
                city: 'Los Angeles',
                state: 'California'
            });
            testUserToken = registerRes.data.token;
            console.log('   ✅ Test user created');
        } catch (err) {
            console.log(`   ⚠️  User registration: ${err.response?.data?.message || err.message}`);
        }

        if (testUserToken) {
            try {
                const postRes = await axios.post(
                    `${API_URL}/api/posts`,
                    {
                        type: 'text',
                        textContent: 'FIRE! URGENT! Building collapse! Multiple people trapped! HELP NEEDED IMMEDIATELY!',
                        city: 'Los Angeles',
                        state: 'California'
                    },
                    {
                        headers: { Authorization: `Bearer ${testUserToken}` }
                    }
                );

                console.log('   ✅ SOS Post created successfully!');
                console.log(`      Post ID: ${postRes.data._id}`);
                console.log(`      Danger Level: ${postRes.data.dangerLevel}`);
                console.log(`      Status: ${postRes.data.status}`);

                if (postRes.data.dangerLevel > 50) {
                    console.log('\n   🎯 Danger level > 50! Alerts should be triggered:');
                    console.log('      ✓ Email should be sent to: nikhilsethin494@gmail.com');
                    console.log('      ✓ Socket alert should be emitted to central_admin room');
                    console.log('      ✓ Red blinking screen should appear on admin dashboard');
                } else {
                    console.log(`\n   ⚠️  Danger level is ${postRes.data.dangerLevel} (need > 50 for alerts)`);
                }

                // Check backend logs
                console.log('\n   📋 Check your backend terminal for:');
                console.log('      - "📧 Attempting to send email..."');
                console.log('      - "✅ Email sent successfully!"');
                console.log('      - Socket emission logs');

            } catch (err) {
                console.log(`   ❌ Failed to create SOS: ${err.response?.data?.message || err.message}`);
                if (err.response?.data) {
                    console.log('   Response:', JSON.stringify(err.response.data, null, 2));
                }
            }
        }

        // Test 5: Check for alerts in database
        console.log('\n5️⃣ Checking Alerts in Database...');
        try {
            const Alert = mongoose.model('Alert', new mongoose.Schema({}, { strict: false }));
            const recentAlerts = await Alert.find({}).sort({ createdAt: -1 }).limit(5);

            if (recentAlerts.length > 0) {
                console.log(`   ✅ Found ${recentAlerts.length} recent alerts:`);
                recentAlerts.forEach((alert, i) => {
                    console.log(`      ${i + 1}. City: ${alert.targetCity}, State: ${alert.targetState}, Active: ${alert.isActive}`);
                });
            } else {
                console.log('   ⚠️  No alerts found in database');
                console.log('   💡 This means no high-danger SOS has been created yet');
            }
        } catch (err) {
            console.log(`   ❌ Error checking alerts: ${err.message}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('DIAGNOSTIC COMPLETE');
        console.log('='.repeat(60));

        console.log('\n📝 NEXT STEPS:');
        console.log('1. Check backend terminal for email sending logs');
        console.log('2. Check email inbox (and spam) at: nikhilsethin494@gmail.com');
        console.log('3. Login to admin dashboard and check for red blinking alert');
        console.log('4. Open browser console (F12) to check for socket messages');

    } catch (err) {
        console.error('\n❌ Diagnostic failed:', err.message);
        console.error(err.stack);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        process.exit(0);
    }
}

runDiagnostics();
