
const Feedback = require('../model/feedback.model'); // Assuming the Feedback model is in the 'models' directory

// POST: Add new feedback
exports.Feedback= async (req, res) => {
  try {
    const { userId, rating, description } = req.body;

    // Validate required fields
    if (!userId || !rating) {
      return res.status(400).json({ message: 'User ID and rating are required.' });
    }

    // Create new feedback
    const feedback = new Feedback({
      userId,
      rating,
      description
    });

    // Save feedback to database
    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'An error occurred while submitting feedback.' });
  }
}

// GET: Fetch all feedback
exports.feedbackList = async (req, res) => {
    try {
      // Retrieve all feedback with user details and company details
      const feedbackList = await Feedback.find()
        .populate({
          path: 'userId',
          select: 'fullName email companyId', // Include companyId and other user details
          populate: {
            path: 'companyId', // Populate company details based on companyId
            select: 'name address contactNumber' // Include only relevant fields from company
          }
        });
  
      if (feedbackList.length === 0) {
        return res.status(404).json({ message: 'No feedback found.' });
      }
  
      res.status(200).json({
        message: 'Feedback fetched successfully',
        feedback: feedbackList
      });
    } catch (err) {
      console.error('Error fetching feedback:', err);
      res.status(500).json({ message: 'An error occurred while fetching feedback.' });
    }
  };
  
  


