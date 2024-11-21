const Company = require('../model/company.model');
require('dotenv').config(); // Load environment variables from .env file
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Function to generate a QR Code as a Base64 data URL
async function generateQRCode(link) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(link);
    console.log('Generated QR Code Data URL:', qrCodeDataURL); // Debug log
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw error;
  }
}

// Function to send an email with the QR Code embedded
async function sendEmailWithQRCode(email, qrCodeDataURL, link) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Yahoo, Outlook, etc.
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });

  // Option to embed the image or attach it
  const mailOptions = {
    from: `"Digital Canteen" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Access Your Digital Canteen Service',
    html: `
      <p>Click the link below to access the digital canteen service:</p>
      <a href="${link}">${link}</a>
      <p>Or scan the QR code attached below:</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrCodeDataURL.split('base64,')[1], // Extract only base64 string
        encoding: 'base64',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}


// Function to add a new company and send a QR code email
exports.addCompany = async (req, res) => {
  try {
    const { name, email, deliveryAddress, numberOfEmployees } = req.body;

    if (!name || !deliveryAddress || !email) {
      return res.status(400).json({ message: 'Company name, email, and delivery address are required.' });
    }

    const newCompany = new Company({
      name,
      email,
      deliveryAddress,
      numberOfEmployees: numberOfEmployees || 0,
    });

    const savedCompany = await newCompany.save();

    // Generate a unique link for the company
    const uniqueCompanyLink = `https://click-meal-website.vercel.app/?companyId=${savedCompany._id}&name=${encodeURIComponent(name)}`;

    // Generate QR Code for the unique link
    const qrCodeDataURL = await generateQRCode(uniqueCompanyLink);

    // Send email with the QR code
    await sendEmailWithQRCode(email, qrCodeDataURL, uniqueCompanyLink);

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
// Delete Company API
exports.deleteCompany = async (req, res) => {
  try {
      const { id } = req.query;

      // Find and delete the company by id
      const deletedCompany = await Company.findByIdAndDelete(id);

      if (!deletedCompany) {
          return res.status(404).json({ message: 'Company not found' });
      }

      res.status(200).json({
          message: 'Company deleted successfully',
          company: deletedCompany // Optionally return the deleted company details
      });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};
