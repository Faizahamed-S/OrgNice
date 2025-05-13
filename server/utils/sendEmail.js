const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,       // from .env
        pass: process.env.EMAIL_PASS        // app password
      }
    });

    const mailOptions = {
      from: `OrgNice <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
