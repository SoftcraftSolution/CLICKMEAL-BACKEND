const Coupon = require('../model/coupan.model');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { couponName, redemptionLimit, description, expiryDate, couponType, employeeName, employeeEmail, companyId } = req.body;

    // Check if all required fields are provided
    if (!couponName || !redemptionLimit || !expiryDate || !couponType) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Create a new coupon instance
    const newCoupon = new Coupon({
      couponName,
      redemptionLimit,
      description,
      expiryDate,
      couponType,
      employeeName,
      employeeEmail,
      companyId,
    });

    // Save the coupon to the database
    await newCoupon.save();

    // Respond with the newly created coupon
    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: newCoupon,
    });
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ message: 'An error occurred while creating the coupon.' });
  }
};
  

// Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    if (coupons.length === 0) {
      return res.status(404).json({ message: 'No coupons found.' });
    }

    res.status(200).json({
      message: 'Coupons fetched successfully',
      coupons,
    });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ message: 'An error occurred while fetching the coupons.' });
  }
};
