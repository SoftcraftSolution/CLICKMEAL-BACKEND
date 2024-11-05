const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Category model
        ref: 'Category', // Name of the model to reference
        required: true, // Make it required if every menu item needs a category
    },
    price: {
        type: Number,
        min: 0
    },
    isVeg: {
        type: Boolean
    },
    description: {
        type: String,
        
    },
    image: {
        type: String,
        
    },
    ingredients: {
        type: [String],
        default: []
    },
    nutritionalInfo: {
        type: [String], // Now an array of strings
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the `updatedAt` field automatically
menuItemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
