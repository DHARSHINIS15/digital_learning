const nodemailer = require('nodemailer');

const createTransporter = async () => {
  // Try to use real SMTP if provided
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'ethereal_username_here') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null; // Return null if no valid credentials
};

const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    // If no transporter exists, throw a clear error forcing real SMTP usage
    if (!transporter) {
        throw new Error("SMTP credentials are not configured in your .env file. Real emails cannot be sent.");
    }

    const info = await transporter.sendMail({
      from: '"Digital Learning Optimizer" <no-reply@dleo.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
