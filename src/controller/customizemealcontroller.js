const CustomizeMeal = require('../model/customizemeal.model');
const cloudinary = require('cloudinary').v2; 

// Create a new menu item
const SubCategory = require('../model/subcategory.model'); // Adjust path as necessary

exports.createCustomizeMeal= async (req, res) => {
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
        const companyId=req.body.companyId;
        
        // Check if the subcategory ID exists in the database
        const subcategory = await SubCategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found.' }); // Handle case where subcategory doesn't exist
        }

        // Prepare the menu item data
        const customizemealData = {
            itemName: req.body.itemName,
            subcategory: subcategory._id, // Use the ObjectId of the subcategory
            price: req.body.price,
            isVeg: req.body.isVeg,
            description: req.body.description,
            ingredients: ingredients, // Use parsed ingredients
            nutritionalInfo: nutritionalInfo,
            companyId:req.body.companyId, // Use parsed nutritional info
            image: image, // Set image URL from Cloudinary if provided
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Log the data being saved
        console.log("customize meal Data to be saved:", customizemealData);

        // Create the menu item using the constructed menuItemData
        const menuItem = new CustomizeMeal(customizemealData);

        await menuItem.save(); // Save the menu item to the database
        res.status(201).json(menuItem); // Respond with the created menu item
    } catch (err) {
        console.error("Error creating menu item:", err); // Log error details
        res.status(400).json({ message: err.message }); // Send error response
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