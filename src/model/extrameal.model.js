const mongoose = require('mongoose');

const ExtraMealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Name is required
        trim: true,
    },
    description: {
        type: String,
        default: '', // Optional description for extra meal
        trim: true,
    },
    price: {
        type: Number,
        required: true, // Price is required
        min: 0, // Price should not be negative
    },
    image: {
        type: String, // URL or file path for the image
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        default: 1, // Default quantity is 1
        min: 0, // Quantity cannot be negative
    },
  
    createdAt: {
        type: Date,
        default: Date.now, // Timestamp for when the item was created
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Timestamp for the last update
    },
});



module.exports = mongoose.model('ExtraMeal', ExtraMealSchema);
