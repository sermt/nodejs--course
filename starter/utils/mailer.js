const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // Load environment variables from.env file

// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

module.exports = sendEmail;
