const cloudinary = require('cloudinary').v2;
const ExtraMeal = require('../model/extrameal.model');

exports.addExtraMeal = async (req, res) => {
    try {
        const { name, description, price, quantity, } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required.' });
        }

        // Initialize image URL
        let imageUrl = null;

        // Check if an image is provided in the request
        if (req.files && req.files.image && req.files.image[0]) {
            console.log('Uploading image to Cloudinary...');
            const imageFile = req.files.image[0];

            // Upload image to Cloudinary
            try {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'extra_meals', resource_type: 'image' },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload error:', error);
                                return reject(error);
                            }
                            resolve(result);
                        }
                    );
                    uploadStream.end(imageFile.buffer);
                });

                imageUrl = result.secure_url; // Get secure URL from the result
                console.log('Image uploaded successfully:', imageUrl);
            } catch (uploadError) {
                return res.status(500).json({ message: 'Failed to upload image to Cloudinary.', error: uploadError });
            }
        }

        // Create a new Extra Meal
        const newExtraMeal = new ExtraMeal({
            name,
            description: description || '', // Default to empty string if no description provided
            price: parseFloat(price), // Ensure price is a number
            quantity: quantity ? parseInt(quantity, 10) : 1, // Default to 1 if not provided
           // Default to true
            image: imageUrl, // Cloudinary image URL
        });

        // Save the new Extra Meal to the database
        const savedExtraMeal = await newExtraMeal.save();

        // Send success response
        res.status(201).json({
            message: 'Extra meal created successfully',
            data: savedExtraMeal,
        });
    } catch (error) {
        console.error('Error creating extra meal:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
exports.getExtraMeals = async (req, res) => {
    try {
        // Fetch all Extra Meals from the database
        const extraMeals = await ExtraMeal.find();

        // Send success response with the list of extra meals
        res.status(200).json({
            message: 'Extra meals fetched successfully',
            data: extraMeals,
        });
    } catch (error) {
        console.error('Error fetching extra meals:', error);

        // Send error response
        res.status(500).json({
            message: 'Internal server error',
            error,
        });
    }
};
