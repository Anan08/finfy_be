const nodemailer = require('nodemailer');

const isDev = process.env.NODE_ENV === 'development';
const url = isDev ? 'http://192.168.1.107:5050/api' : process.env.BACKEND_URL;

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

exports.sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${url}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"No Reply" <${process.env.MAIL_FROM}>`,
    to : to,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `
  });
};
