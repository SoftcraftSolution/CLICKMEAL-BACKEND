const MenuItem = require('../model/item.model');
const cloudinary = require('cloudinary').v2; 
const User=require('../model/user.model')
// Create a new menu item
const SubCategory = require('../model/subcategory.model'); // Adjust path as necessary

const nodemailer = require('nodemailer'); // Ensure Nodemailer is installed

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
            return res.status(404).json({ message: 'Subcategory not found.' });
        }

        // Prepare the menu item data
        const menuItemData = {
            itemName: req.body.itemName,
            subcategory: subcategory._id,
            price: req.body.price,
            isVeg: req.body.isVeg,
            description: req.body.description,
            ingredients: ingredients,
            nutritionalInfo: nutritionalInfo,
            image: image,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Log the data being saved
        console.log("Menu Item Data to be saved:", menuItemData);

        // Create the menu item using the constructed menuItemData
        const menuItem = new MenuItem(menuItemData);

        await menuItem.save(); // Save the menu item to the database

        // Fetch all registered users
        const users = await User.find({}, 'email fullName'); // Fetch only emails and names
        if (!users || users.length === 0) {
            console.warn('No registered users found.');
        } else {
            console.log(`Sending email to ${users.length} users...`);

            // Nodemailer configuration
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Use your email service
                auth: {
                    user: process.env.EMAIL_USER, // Your email address
                    pass: process.env.EMAIL_PASS  // Your email password or app password
                }
            });

            // Email content
            const emailSubject = `New Menu Item Added: ${menuItem.itemName}`;
            const emailText = `
                Hello,
                
                We have added a new item to our menu: ${menuItem.itemName}.
                
                Description: ${menuItem.description}
                Price: $${menuItem.price}
                
                Check it out now!

                Best regards,
                Your Company Team
            `;

            // Send emails to all users
            for (const user of users) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER, // Sender email address
                    to: user.email,              // Recipient email address
                    subject: emailSubject,       // Email subject
                    text: emailText              // Email body
                });
            }

            console.log('Emails sent successfully!');
        }

        res.status(201).json(menuItem); // Respond with the created menu item
    } catch (err) {
        console.error("Error creating menu item:", err);
        res.status(400).json({ message: err.message });
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
      const { itemId } = req.query; // Retrieve itemId from query parameters
  
      if (!itemId) {
        return res.status(400).json({ message: 'itemId is required' });
      }
  
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
  
      res.status(200).json(menuItem);
    } catch (err) {
      console.error('Error fetching menu item:', err);
      res.status(500).json({ message: 'An error occurred while fetching the menu item.' });
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
        const menuItemId = req.query.id; // Get ID from query parameters
        if (!menuItemId) {
            return res.status(400).json({ message: 'Menu item ID is required' });
        }

        const menuItem = await MenuItem.findByIdAndDelete(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
