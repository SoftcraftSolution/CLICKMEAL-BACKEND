const MenuItem = require('../model/item.model');
const cloudinary = require('cloudinary').v2; 

// Create a new menu item
const SubCategory = require('../model/subcategory.model'); // Adjust path as necessary

exports.createMenuItem = async (req, res) => {
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
        
        // Check if the subcategory ID exists in the database
        const subcategory = await SubCategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found.' }); // Handle case where subcategory doesn't exist
        }

        // Prepare the menu item data
        const menuItemData = {
            itemName: req.body.itemName,
            subcategory: subcategory._id, // Use the ObjectId of the subcategory
            price: req.body.price,
            isVeg: req.body.isVeg,
            description: req.body.description,
            ingredients: ingredients, // Use parsed ingredients
            nutritionalInfo: nutritionalInfo, // Use parsed nutritional info
            image: image, // Set image URL from Cloudinary if provided
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Log the data being saved
        console.log("Menu Item Data to be saved:", menuItemData);

        // Create the menu item using the constructed menuItemData
        const menuItem = new MenuItem(menuItemData);

        await menuItem.save(); // Save the menu item to the database
        res.status(201).json(menuItem); // Respond with the created menu item
    } catch (err) {
        console.error("Error creating menu item:", err); // Log error details
        res.status(400).json({ message: err.message }); // Send error response
    }
};


// Get all menu items
exports.getAllMenuItems = async (req, res) => {
    try {
        // Find all menu items and populate both subcategory and category fields
        const menuItems = await MenuItem.find()
            .populate('subcategory') // Populate the subcategory field
            .populate({
                path: 'subcategory', // Specify subcategory path to include category data
                populate: {
                    path: 'categoryId', // Populate the category field within subcategory
                    model: 'Category', // The model to populate category (assuming it's 'Category')
                },
            });

        if (menuItems.length === 0) {
            return res.status(404).json({ message: 'No menu items found.' }); // Handle case when no menu items are found
        }

        res.status(200).json(menuItems); // Respond with the populated menu items
    } catch (err) {
        console.error("Error fetching menu items:", err); // Log error details
        res.status(500).json({ message: err.message }); // Send error response
    }
};



// Get a single menu item by ID
exports.getMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a menu item by ID
exports.updateMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a menu item by ID
exports.deleteMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
