const nodemailer = require('nodemailer');

// Gmail SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER || 'nikhilsethin494@gmail.com',
            pass: process.env.GMAIL_APP_PASS
        }
    });
};

const sendAlertEmail = async (toEmails, subject, htmlContent) => {
    try {
        if (!toEmails || toEmails.length === 0) {
            console.log('⚠️ No recipient emails provided, skipping email send');
            return;
        }

        const appPass = process.env.GMAIL_APP_PASS;
        if (!appPass) {
            console.error('❌ Cannot send email: GMAIL_APP_PASS not set in .env');
            return;
        }

        console.log('📧 Attempting to send email via Gmail SMTP...');
        console.log('   To:', toEmails);
        console.log('   Subject:', subject);

        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: `"ResQ Connect Alerts" <${process.env.GMAIL_USER || 'nikhilsethin494@gmail.com'}>`,
            to: toEmails.join(', '),
            subject: subject,
            html: htmlContent
        });

        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        return info;

    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        if (error.message.includes('Invalid login') || error.message.includes('Username and Password')) {
            console.error('💡 TIP: Make sure GMAIL_APP_PASS in .env is a valid Gmail App Password (not your regular Gmail password).');
            console.error('   Generate one at: https://myaccount.google.com/apppasswords');
        }
        return null;
    }
};

module.exports = { sendAlertEmail };

// Helper function to create detailed alert email HTML
const createAlertEmailHTML = (alertData) => {
    const { city, state, dangerLevel, postId, content, type, timestamp, escalationInfo } = alertData;

    // Determine danger level color and label
    let dangerColor = '#dc2626'; // red
    let dangerLabel = 'HIGH DANGER';
    if (dangerLevel >= 80) {
        dangerColor = '#991b1b'; // dark red
        dangerLabel = 'CRITICAL DANGER';
    } else if (dangerLevel >= 60) {
        dangerColor = '#dc2626'; // red
        dangerLabel = 'HIGH DANGER';
    } else {
        dangerColor = '#ea580c'; // orange
        dangerLabel = 'MODERATE DANGER';
    }

    // Escalation banner if present
    let escalationBanner = '';
    if (escalationInfo) {
        escalationBanner = `
            <tr>
                <td style="background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%); padding: 20px; text-align: center; border-bottom: 3px solid #dc2626;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold; text-transform: uppercase;">
                        🆘 HELP REQUEST ${escalationInfo.level ? `- ${escalationInfo.level}` : ''}
                    </h2>
                    <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 14px;">
                        Requested by: ${escalationInfo.from}
                    </p>
                </td>
            </tr>
        `;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 3px solid ${dangerColor}; border-radius: 8px; overflow: hidden;">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, ${dangerColor} 0%, #000000 100%); padding: 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                                        🚨 EMERGENCY ALERT 🚨
                                    </h1>
                                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                                        ${dangerLabel}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Danger Level Bar -->
                            <tr>
                                <td style="padding: 0; background-color: #000000;">
                                    <div style="width: ${dangerLevel}%; height: 8px; background-color: ${dangerColor};"></div>
                                </td>
                            </tr>
                            
                            ${escalationBanner}
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 30px; background-color: #1a1a1a;">
                                    
                                    <!-- Danger Score -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                        <tr>
                                            <td style="text-align: center; padding: 20px; background-color: ${dangerColor}; border-radius: 8px;">
                                                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: bold;">DANGER LEVEL</p>
                                                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 48px; font-weight: bold;">${dangerLevel}</p>
                                                <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">out of 100</p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Location Information -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; background-color: #2a2a2a; border-radius: 8px; padding: 20px;">
                                        <tr>
                                            <td>
                                                <h2 style="margin: 0 0 15px 0; color: ${dangerColor}; font-size: 20px; border-bottom: 2px solid ${dangerColor}; padding-bottom: 10px;">
                                                    📍 LOCATION DETAILS
                                                </h2>
                                                <table width="100%" cellpadding="8" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #999999; font-size: 14px; width: 30%;">City:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold;">${city}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #999999; font-size: 14px;">State:</td>
                                                        <td style="color: #ffffff; font-size: 16px; font-weight: bold;">${state}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #999999; font-size: 14px;">Report ID:</td>
                                                        <td style="color: #ffffff; font-size: 14px; font-family: monospace;">${postId}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #999999; font-size: 14px;">Timestamp:</td>
                                                        <td style="color: #ffffff; font-size: 14px;">${timestamp}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Emergency Content -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; background-color: #2a2a2a; border-radius: 8px; padding: 20px;">
                                        <tr>
                                            <td>
                                                <h2 style="margin: 0 0 15px 0; color: ${dangerColor}; font-size: 20px; border-bottom: 2px solid ${dangerColor}; padding-bottom: 10px;">
                                                    📋 EMERGENCY DETAILS
                                                </h2>
                                                <p style="margin: 0; color: #cccccc; font-size: 14px; line-height: 1.6;">
                                                    <strong style="color: #ffffff;">Type:</strong> ${type.toUpperCase()}<br>
                                                    <strong style="color: #ffffff;">Content:</strong> ${content.length > 200 ? content.substring(0, 200) + '...' : content}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Action Required -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #2a2a2a; border-left: 4px solid ${dangerColor}; padding: 15px; border-radius: 4px;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: bold;">⚠️ IMMEDIATE ACTION REQUIRED</p>
                                                <p style="margin: 10px 0 0 0; color: #cccccc; font-size: 14px; line-height: 1.5;">
                                                    This is a high-priority emergency alert. Please log in to the ResQ Connect admin dashboard immediately to review and respond to this incident.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px; background-color: #000000; text-align: center; border-top: 1px solid #333333;">
                                    <p style="margin: 0; color: #666666; font-size: 12px;">
                                        ResQ Connect Emergency Response System<br>
                                        Automated Alert • Do Not Reply to This Email
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

module.exports = { sendAlertEmail, createAlertEmailHTML };

