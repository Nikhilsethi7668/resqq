// Test script to send a sample alert email with the new design
const { createAlertEmailHTML, sendAlertEmail } = require('./services/emailService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('📧 Sending test alert email with new design...\n');

const testHTML = createAlertEmailHTML({
    city: 'Los Angeles',
    state: 'California',
    dangerLevel: 85,
    postId: '507f1f77bcf86cd799439011',
    content: 'FIRE! Building collapse on Main Street! Multiple people trapped! URGENT HELP NEEDED! Smoke visible from 2 blocks away. Emergency services needed immediately!',
    type: 'text',
    timestamp: new Date().toLocaleString()
});

sendAlertEmail(
    ['nikhilsethin494@gmail.com'],
    '🚨 URGENT: High Danger SOS in Los Angeles, California',
    testHTML
).then(() => {
    console.log('\n✅ Test email sent!');
    console.log('📬 Check your inbox at: nikhilsethin494@gmail.com');
    console.log('\nThe email should now have:');
    console.log('  • Black/red urgent design');
    console.log('  • Danger level: 85/100');
    console.log('  • Location: Los Angeles, California');
    console.log('  • Emergency details');
    console.log('  • Timestamp');
}).catch(err => {
    console.error('❌ Error:', err.message);
});
