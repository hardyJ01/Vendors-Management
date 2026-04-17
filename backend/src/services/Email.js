const nodemailer = require('nodemailer');

const buildTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ email, otp, purpose }) => {
  const transporter = buildTransport();
  const subject = purpose === 'reset_password' ? 'Password reset OTP' : 'Registration OTP';
  const text = `Your OTP is ${otp}. It expires in 10 minutes.`;

  if (!transporter) {
    console.log(`[OTP EMAIL FALLBACK] ${purpose} OTP for ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    text,
  });
};

module.exports = {
  sendOtpEmail,
};
