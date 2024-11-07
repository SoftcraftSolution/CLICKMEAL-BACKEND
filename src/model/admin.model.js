const mongoose = require('mongoose');

// Define the registration schema with timestamps
const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
    }
    // updated vercel
}, { timestamps: true });

// Create the model from the schema
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
