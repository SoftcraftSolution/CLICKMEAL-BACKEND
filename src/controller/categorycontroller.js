const Category = require('../model/category.model'); // Ensure this points to your model
const cloudinary = require('cloudinary').v2; // Import Cloudinary for image uploads

// Controller function to handle home updates
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

     

        // Log the entire request to check if files are being sent
        console.log('Request body:', req.body);
        console.log('Request files:', req.files); // Log all files received

        let image = null;

        // Check if image is received in the request
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
                            reject(error);
                        }
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(imageFile.buffer); // Pass the buffer to the upload stream
            });
        }

        console.log('Uploaded image URL:', image);

        // Create new home update
        const newCategory = new Category({
            name,
            image: image || null, // Image URL from Cloudinary
        });

        await newCategory.save();

        res.status(201).json({
            message: 'category added successfully created',
            category: newCategory,
        });
    } catch (error) {
        console.error('Error while adding category :', error);
        res.status(500).json({ message: 'An error occurred while uploading the category.' });
    }
};
exports.CategoryList = async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories from the database
        
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

