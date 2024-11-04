// models/Company.js
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    deliveryAddress: { 
        type: String, 
        required: true 
    },
    numberOfEmployees: { 
        type: Number, 
        default: 0 // Optional, defaults to 0 if not provided
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;
