require('dotenv').config(); // Load environment variables from .env file
const nodemailer = require('nodemailer');
const Admin = require('../model/admin.model'); // Adjust the path as needed

// Default admin credentials
// Default admin credentials
 // Default password

// Login API
const defaultEmail = 'kannoujiaaryan@gmail.com'; // Default email
const defaultPassword = 'defaultPassword123'; // Default password

// Login API
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check if the provided password matches either the default password or the stored password
      const isValidPassword = password === defaultPassword || (admin.hasResetPassword && password === admin.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // Successful login response
      res.status(200).json({ message: 'Login successful.', admin: { email: admin.email } });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
  
  



// Forgot Password API
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Verify if the provided email matches the default admin email
    if (email !== defaultEmail) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Generate a random OTP (6 digits)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save the OTP in the Admin model (assuming there's only one admin)
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = new Admin({ email, password: defaultPassword }); // Create default admin if not present
    }
    admin.otp = otp;
    await admin.save();

    // Send OTP via email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service provider
      auth: {
        user: process.env.EMAIL_USERNAME, // Use environment variable
        pass: process.env.EMAIL_PASSWORD, // Use environment variable
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM, // Use environment variable
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email.',otp });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
exports.verifyCode = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check if the provided OTP matches the one stored in the database
      if (admin.otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }
  
      // If OTP is valid
      res.status(200).json({ message: 'Reset code verified successfully' });
    } catch (err) {
      console.error('Error verifying reset code:', err);
      res.status(500).json({ error: 'Error verifying reset code' });
    }
  };
  
// Reset Password API
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      // Find the admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Verify the OTP
      if (admin.otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }
  
      // Update the password and set the reset flag
      admin.password = newPassword;
      admin.hasResetPassword = true; // Set the flag to indicate a reset has occurred
      admin.otp = null; // Clear the OTP after successful reset
      await admin.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
