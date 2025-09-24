const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendLoginEmail = (to, token) => {
  const link = `${process.env.FRONTEND_URL}/api/auth/verify/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Login Link',
    html: `<p>Click below to login:</p><a href="${link}">Login</a>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendLoginEmail;
