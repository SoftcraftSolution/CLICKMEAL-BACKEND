const mongoose = require('mongoose');

// Create a category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        // Ensure that the category name is unique
    },
    image: {
        type: String,
      
    },
    createdAt: {
        type: Date,
        default: Date.now, // Default to the current date
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Default to the current date
    },
});

// Middleware to update the `updatedAt` field on save

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
