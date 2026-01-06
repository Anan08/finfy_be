const nodemailer = require('nodemailer');

const isDev = true
const url = isDev ? 'http://192.168.1.105:5050' : process.env.FRONTEND_URL;

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth : {
        user : process.env.MAIL_USER,
        pass : process.env.MAIL_PASS
    }
}); 

exports.sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${url}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from : `"No Reply" <${process.env.MAIL_FROM}>`,
        to : to,
        subject : 'Verify your email',
        html : `
        <h1>Email Verification</h1>
        <p>Please verify your email by clicking the link below:</p>
                <a href="${verifyUrl}">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
        `
    });
}