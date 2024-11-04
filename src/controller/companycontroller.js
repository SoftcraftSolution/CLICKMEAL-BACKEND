// controllers/companyController.js
const Company = require('../model/company.model');

exports.addCompany = async (req, res) => {
    try {
        const { name, deliveryAddress, numberOfEmployees } = req.body;

        // Validate required fields
        if (!name || !deliveryAddress) {
            return res.status(400).json({ message: 'Company name and delivery address are required.' });
        }

        // Create new company
        const newCompany = new Company({
            name,
            deliveryAddress,
            numberOfEmployees: numberOfEmployees || 0, // Set to 0 if not provided
        });

        // Save company to the database
        const savedCompany = await newCompany.save();

        // Send success response
        res.status(201).json({
            message: 'Company added successfully.',
            data: savedCompany
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding company.', 
            error: error.message 
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