// controllers/companyController.js
const Company = require('../model/company.model');
require('dotenv').config(); // Load environment variables from .env file
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

async function generateQRCode(link) {
  try {
    // Generate QR Code as a Data URL (Base64 encoded)
    const qrCodeDataURL = await QRCode.toDataURL(link);
    return qrCodeDataURL; // Return the data URL for embedding
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw error;
  }
}

async function sendEmailWithQRCode(email, qrCodeDataURL, link) {
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
    from: `"Digital Canteen" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Access Your Digital Canteen Service',
    html: `
      <p>Click the link below to access the digital canteen service:</p>
      <a href="${link}">${link}</a>
      <p>Or scan the QR code below:</p>
      <img src="${qrCodeDataURL}" alt="QR Code" />
    `,
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

exports.addCompany = async (req, res) => {
  try {
    const { name, email, deliveryAddress, numberOfEmployees } = req.body;

    // Validate required fields
    if (!name || !deliveryAddress || !email) {
      return res.status(400).json({ message: 'Company name, email, and delivery address are required.' });
    }

    // Create new company
    const newCompany = new Company({
      name,
      email,
      deliveryAddress,
      numberOfEmployees: numberOfEmployees || 0, // Set to 0 if not provided
    });

    // Save company to the database
    const savedCompany = await newCompany.save();

    // Generate a unique link or identifier for the company (modify as needed)
    const uniqueCompanyLink = `https://click-meal-website.vercel.app/?companyId=${savedCompany._id}`;

    // Generate QR Code for the unique company link
    const qrCodeDataURL = await generateQRCode(uniqueCompanyLink);

    // Send email with QR code embedded
    await sendEmailWithQRCode(email, qrCodeDataURL, uniqueCompanyLink);

    // Send success response
    res.status(201).json({
      message: 'Company added successfully and QR code email sent.',
      data: savedCompany,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Error adding company.',
      error: error.message,
    });
  }
};


exports.getCompanyList = async (req, res) => {
    try {
        // Fetch all companies from the database
        const companies = await Company.find();

        // Send success response with company list
        res.status(200).json({
            message: 'Companies retrieved successfully.',
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving companies.',
            error: error.message
        });
    }
};