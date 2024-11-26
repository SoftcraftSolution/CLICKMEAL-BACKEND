const CustomizeMeal = require('../model/customizemeal.model');
const cloudinary = require('cloudinary').v2;
const SubCategory = require('../model/subcategory.model');
const User = require('../model/user.model');
const nodemailer = require('nodemailer');

exports.createCustomizeMeal = async (req, res) => {
    try {
        let image = null;

        // Check if an image is received in the request
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('Uploading image...');

            const imageFile = req.files.image[0]; // Access the image file buffer

            // Upload image buffer to Cloudinary
            image = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'images', resource_type: 'image' },
                    (error, result) => {
                        if (error) {
                            console.error('Error uploading to Cloudinary:', error);
                            return reject(error);
                        }
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(imageFile.buffer); // Pass the buffer to the upload stream
            });
        }

        console.log('Uploaded image URL:', image);

        // Parse ingredients and nutritionalInfo to ensure they are arrays
        const ingredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : JSON.parse(req.body.ingredients || "[]");
        const nutritionalInfo = Array.isArray(req.body.nutritionalInfo) ? req.body.nutritionalInfo : JSON.parse(req.body.nutritionalInfo || "[]");

        // Use the subcategory ID directly from the request body
        const subcategoryId = req.body.subcategory;
        const companyId = req.body.companyId;

        // Validate the subcategory
        const subcategory = await SubCategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found.' });
        }

        // Prepare the Customize Meal data
        const customizemealData = {
            itemName: req.body.itemName,
            subcategory: subcategory._id,
            price: req.body.price,
            isVeg: req.body.isVeg,
            description: req.body.description,
            image: image,
            companyId: companyId,
            ingredients: ingredients,
            nutritionalInfo: nutritionalInfo,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Log the data being saved
        console.log("Customize meal data to be saved:", customizemealData);

        // Save the new Customize Meal entry
        const newMeal = new CustomizeMeal(customizemealData);
        await newMeal.save();

        // Fetch users associated with the companyId
        const users = await User.find({ companyId });

        if (!users || users.length === 0) {
            console.warn(`No users found for the company with ID: ${companyId}`);
            return res.status(201).json({
                message: 'Customize meal created successfully, but no users found to notify.',
                newMeal,
            });
        }

        console.log(`Notifying ${users.length} users about the new customize meal.`);

        // Nodemailer configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USERNAME, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password or app password
            },
        });

        // Email subject and body
        const emailSubject = `New Customize Meal Added: ${newMeal.itemName}`;
        const emailText = `
            Hello,

            Your company has added a new customized meal to the menu!

            Item Name: ${newMeal.itemName}
            Description: ${newMeal.description}
            Price: $${newMeal.price}

            Check it out now!

            Best regards,
            Your Company Team
        `;

        // Send emails to all users of the company
        for (const user of users) {
            await transporter.sendMail({
                from: process.env.EMAIL_USERNAME, // Sender email address
                to: user.email, // Recipient email address
                subject: emailSubject, // Email subject
                text: emailText, // Email body
            });
        }

        console.log('Emails sent successfully!');

        res.status(201).json({ message: 'Customize meal created successfully and users notified.', newMeal });
    } catch (err) {
        console.error("Error creating customize meal:", err);
        res.status(500).json({ message: 'Error creating customize meal.', error: err.message });
    }
};

exports.getAllCustomizeMeals = async (req, res) => {
    try {
        const meals = await CustomizeMeal.find().populate('subcategory', 'name').populate('companyId', 'name'); // Adjust fields as necessary
        res.status(200).json({ message: 'All customized meals retrieved successfully', meals });
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteCustomizeMeal = async (req, res) => {
    try {
        const mealId = req.query.id; // Get the ID from query parameters

        // Validate if ID is provided
        if (!mealId) {
            return res.status(400).json({ message: 'Meal ID is required.' });
        }

        // Attempt to find and delete the customize meal
        const deletedMeal = await CustomizeMeal.findByIdAndDelete(mealId);

        if (!deletedMeal) {
            return res.status(404).json({ message: 'Customize meal not found.' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Customize meal deleted successfully.' });
    } catch (error) {
        console.error('Error deleting customize meal:', error);
        res.status(500).json({ message: 'An error occurred while deleting the customize meal.', error });
    }
};
exports.getCustomizeMealsByCompany = async (req, res) => {
    try {
        const { companyId } = req.query; // Get the companyId from query parameters

        // Validate that companyId is provided
        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required.' });
        }

        // Fetch customized meals associated with the given companyId
        const meals = await CustomizeMeal.find({ companyId })
            .populate('subcategory', 'name') // Populate subcategory details
            .populate('companyId', 'name'); // Populate company details

        // Check if meals exist for the company
        if (!meals || meals.length === 0) {
            return res.status(404).json({ message: 'No customized meals found for the specified company.' });
        }

        // Return the meals in the response
        res.status(200).json({
            message: 'Customized meals retrieved successfully.',
            meals,
        });
    } catch (error) {
        console.error('Error fetching meals by companyId:', error);
        res.status(500).json({
            message: 'An error occurred while fetching customized meals.',
            error: error.message,
        });
    }
};
