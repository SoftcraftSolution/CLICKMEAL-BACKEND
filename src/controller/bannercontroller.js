const Banner=require('../model/banner.model')
const cloudinary = require('cloudinary').v2;


exports.addBanner = async (req, res) => {
    try {
        const { name } = req.body; // Expecting only the name in the request body for the banner

        // Check if an image file was uploaded
        let imageUrl = null;
        if (req.files && req.files.image && req.files.image[0]) {
            const imageFile = req.files.image[0];

            // Upload image to Cloudinary
            imageUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'banners', resource_type: 'image' },
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

        // Create a new banner with the name and image URL
        const newBanner = new Banner({
            name,
            image: imageUrl, // Set the uploaded image URL
        });

        await newBanner.save(); // Save the new banner

        res.status(201).json({
            message: 'Banner added successfully',
            banner: newBanner, // Return the new banner object
        });
    } catch (error) {
        console.error('Error while adding banner:', error);
        res.status(500).json({ message: 'An error occurred while adding the banner.' });
    }
};
exports.bannerList = async (req, res) => {
    try {
        // Fetch all banners from the database
        const banners = await Banner.find(); // You can add filters or pagination if needed

        if (banners.length === 0) {
            return res.status(404).json({ message: 'No banners found' });
        }

        // Return the list of banners
        res.status(200).json({
            message: 'Banners fetched successfully',
            banners, // Sending the banners in the response
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'An error occurred while fetching banners.' });
    }
};