const Reward = require('../model/reward.model');
const cloudinary = require('cloudinary').v2;






exports.createReward = async (req, res) => {
  try {
    // Handle image upload to Cloudinary
    let image = null;
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

    // Parse arrays from form-data (if they were sent as stringified JSON)
    const aboutOffer = Array.isArray(req.body.aboutOffer) ? req.body.aboutOffer : JSON.parse(req.body.aboutOffer || '[]');
    const termsOfUse = Array.isArray(req.body.termsOfUse) ? req.body.termsOfUse : JSON.parse(req.body.termsOfUse || '[]');

    // Create the reward with image URL (if provided) and parsed data
    const reward = await new Reward({
      ...req.body,
      aboutOffer,
      termsOfUse,
      uploadImage: image
    }).save();

    res.status(201).json({ message: 'Reward created', reward });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ message: 'Error creating reward', error });
  }
};


// Controller to fetch all rewards
exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    if (rewards.length === 0) {
      return res.status(404).json({ message: 'No rewards found' });
    }
    res.status(200).json({ message: 'Rewards fetched successfully', rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Error fetching rewards', error });
  }
};


exports.deleteReward = async (req, res) => {
  try {
    const rewardId = req.query.id; // Get the ID from query parameters

    // Validate if ID is provided
    if (!rewardId) {
      return res.status(400).json({ message: 'Reward ID is required.' });
    }

    // Attempt to find and delete the reward
    const deletedReward = await Reward.findByIdAndDelete(rewardId);

    if (!deletedReward) {
      return res.status(404).json({ message: 'Reward not found.' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Reward deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ message: 'An error occurred while deleting the reward.', error });
  }
};
