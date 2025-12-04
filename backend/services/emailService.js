const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

const sendAlertEmail = async (toEmails, subject, text) => {
    try {
        const info = await transport.sendMail({
            from: '"ResQ Alert" <alert@resqconnect.com>',
            to: toEmails.join(','),
            subject: subject,
            text: text,
            html: `<b>${text}</b>`
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

module.exports = { sendAlertEmail };
