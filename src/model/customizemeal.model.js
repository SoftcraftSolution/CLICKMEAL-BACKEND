const mongoose = require('mongoose');

const customizemealSchema = new mongoose.Schema({
    itemName: {
        type: String,
        
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Category model
        ref: 'Subcategory', // Name of the model to reference
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
    companyId:{
        type:String
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


const  customizemeal = mongoose.model('CustomizeMeal',  customizemealSchema);

module.exports =customizemeal ;
