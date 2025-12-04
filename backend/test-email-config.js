// Quick test script to verify email configuration
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Email Configuration Test\n');
console.log('='.repeat(50));

// Check 1: API Key
console.log('\n1️⃣ Checking Resend API Key...');
if (process.env.mail_resend_key) {
    const keyPreview = process.env.mail_resend_key.substring(0, 8) + '...';
    console.log(`   ✅ API key found: ${keyPreview}`);
} else {
    console.log('   ❌ API key NOT found in .env file');
    console.log('   💡 Add this to your .env file:');
    console.log('      mail_resend_key=re_your_actual_key_here');
    process.exit(1);
}

// Check 2: From Email
console.log('\n2️⃣ Checking From Email...');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
console.log(`   📧 From email: ${fromEmail}`);
if (fromEmail === 'onboarding@resend.dev') {
    console.log('   ℹ️  Using Resend testing email (good for development)');
} else {
    console.log('   ℹ️  Using custom domain (make sure it\'s verified in Resend)');
}

// Check 3: Test Email Send
console.log('\n3️⃣ Testing Email Send...');
console.log('   Sending test email to: nikhilsethin494@gmail.com');

const resend = new Resend(process.env.mail_resend_key);

async function sendTestEmail() {
    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: ['nikhilsethin494@gmail.com'],
            subject: '🧪 ResQQ Email Test',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <h2 style="color: #10b981; margin-top: 0;">✅ Email Configuration Working!</h2>
                        <p style="font-size: 16px; color: #333;">
                            If you're reading this, your ResQQ email system is configured correctly.
                        </p>
                        <p style="font-size: 14px; color: #666;">
                            <strong>Test Details:</strong><br>
                            - Sent at: ${new Date().toLocaleString()}<br>
                            - From: ${fromEmail}<br>
                            - API Key: ${process.env.mail_resend_key.substring(0, 8)}...
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999;">
                            ResQ Connect Emergency Response System - Email Test
                        </p>
                    </div>
                </div>
            `
        });

        console.log('\n✅ TEST PASSED!');
        console.log('   Email sent successfully');
        console.log('   Email ID:', data.id);
        console.log('\n📬 Check your inbox (and spam folder) at: nikhilsethin494@gmail.com');
        console.log('\n' + '='.repeat(50));
        console.log('✅ Email system is working correctly!');
        console.log('   Alerts should now be sent when high-danger SOS reports are created.');

    } catch (error) {
        console.log('\n❌ TEST FAILED!');
        console.log('   Error:', error.message);

        console.log('\n🔧 Troubleshooting Tips:');

        if (error.message.includes('API key')) {
            console.log('   • Your API key might be invalid');
            console.log('   • Get a new key from: https://resend.com/api-keys');
            console.log('   • Make sure you copied the entire key (starts with "re_")');
        } else if (error.message.includes('domain') || error.message.includes('from')) {
            console.log('   • The "from" email address needs to be verified');
            console.log('   • Option 1: Use onboarding@resend.dev (already configured)');
            console.log('   • Option 2: Verify your domain at https://resend.com/domains');
        } else if (error.message.includes('rate limit')) {
            console.log('   • You\'ve hit Resend rate limits');
            console.log('   • Wait a few minutes and try again');
            console.log('   • Consider upgrading your Resend plan for higher limits');
        } else {
            console.log('   • Check Resend status: https://status.resend.com');
            console.log('   • Review error details above');
            console.log('   • See EMAIL_TROUBLESHOOTING.md for more help');
        }

        console.log('\n' + '='.repeat(50));
        process.exit(1);
    }
}

sendTestEmail();
