const Category = require('../model/category.model'); // Ensure this points to your model
const cloudinary = require('cloudinary').v2;
 const Subcategory=require('../model/subcategory.model')

// Controller function to handle home updates
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body; // Expecting name in the request body

        // Create a new category
        const newCategory = new Category({
            name,
        });

        await newCategory.save();

        res.status(201).json({
            message: 'Category added successfully',
            category: newCategory,
        });
    } catch (error) {
        console.error('Error while adding category:', error);
        res.status(500).json({ message: 'An error occurred while adding the category.' });
    }
};
exports.CategoryList = async (req, res) => {
    try {
        const categories = await Category.find().populate('subcategories'); // Fetch all categories with populated subcategories

        if (categories.length === 0) {
            return res.status(404).json({ 
                message: 'No categories found.' 
            }); // Custom message if no categories are found
        }

        res.status(200).json({ 
            message: 'Categories fetched successfully.', 
            data: categories 
        }); // Success message along with the data
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching categories.', 
            error: error.message 
        }); // Custom error message
    }
};
exports.addSubcategory = async (req, res) => {
    try {
        const { categoryId, name } = req.body; // Expecting categoryId and name in the request body

        // Find the category to which the subcategory will be added
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if an image file was uploaded
        let imageUrl = null;
        if (req.files && req.files.image && req.files.image[0]) {
            const imageFile = req.files.image[0];

            // Upload image to Cloudinary
            imageUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'subcategories', resource_type: 'image' },
                    (error, result) => {
                        if (error) {
                            console.error('Error uploading to Cloudinary:', error);
                            return reject(error);
                        }
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(imageFile.buffer); // End the stream with the file buffer
            });
        }

        // Create a new subcategory
        const newSubcategory = new Subcategory({
            name,
            image: imageUrl, // Set the uploaded image URL
            categoryId: category._id, // Set the categoryId reference to the category
        });

        await newSubcategory.save(); // Save the new subcategory with the categoryId

        // Push the subcategory into the category's subcategories array
        category.subcategories.push(newSubcategory._id); // Push the subcategory ID into the category's subcategories
        await category.save(); // Save the updated category

        res.status(201).json({
            message: 'Subcategory added successfully',
            subcategory: newSubcategory, // Return the new subcategory
        });
    } catch (error) {
        console.error('Error while adding subcategory:', error);
        res.status(500).json({ message: 'An error occurred while adding the subcategory.' });
    }
};