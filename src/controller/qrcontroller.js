require('dotenv').config(); // Load environment variables from .env file
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs');

async function generateQRCode(link) {
  const filePath = 'qrcode.png'; // Path to save the QR code image
  try {
    await QRCode.toFile(filePath, link); // Generate and save QR code as image
    return filePath; // Return the file path for further use
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw error;
  }
}

async function sendEmailWithQRCode(email, filePath, link) {
  // Configure the transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Yahoo, Outlook, etc.
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });

  // Mail options
  const mailOptions = {
    from: '"Digital Canteen" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Access Your Digital Canteen Service',
    html: `
      <p>Click the link below to access the digital canteen service:</p>
      <a href="${link}">${link}</a>
      <p>Or scan the attached QR code:</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        path: filePath,
        cid: 'qrcode_cid', // Unique identifier for embedding if needed
      },
    ],
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

exports.createAndSendQRCode = async (req, res) => {
  const { email, link } = req.body; // Extract email and link from request body

  if (!email || !link) {
    return res.status(400).json({ message: 'Email and link are required.' });
  }

  try {
    // Step 1: Generate QR Code and save as image
    const filePath = await generateQRCode(link);

    // Step 2: Send email with the QR code image attached
    await sendEmailWithQRCode(email, filePath, link);

    // Optionally, delete the QR code image after sending the email (cleanup)
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'QR code generated and email sent successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
};
