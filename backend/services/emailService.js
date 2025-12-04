const { Resend } = require('resend');

const resend = new Resend(process.env.mail_resend_key);

const sendAlertEmail = async (toEmails, subject, text) => {
    try {
        const data = await resend.emails.send({
            from: 'alert@gmail.com', // User requested this, though Resend usually requires verified domain
            to: toEmails,
            subject: subject,
            html: `<b>${text}</b>`
        });
        console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendAlertEmail };
