const Order = require('../model/order.model'); // Assuming the Order model is in the 'models' directory
const MenuItem = require('../model/item.model');
const Company = require('../model/company.model'); // Replace with your actual model path
const Employee = require('../model/user.model'); // Replace with your actual model path
const Feedback = require('../model/feedback.model');
const User = require('../model/user.model'); // Assuming MenuItem model is in the 'models' directory

// Add new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryDate } = req.body;

    // Validate that all required fields are provided
    if (!userId || !items || !paymentMethod || !deliveryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Calculate the total price based on the item prices and quantities
    let totalPrice = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId); // Fetch item details by itemId
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item with ID ${item.itemId} not found.` });
      }
      
      // Multiply the item price by quantity and add it to totalPrice
      totalPrice += menuItem.price * item.quantity;
    }

    // Create a new order object based on the provided data
    const newOrder = new Order({
      userId,
      items,
      totalPrice,
      paymentMethod,
      paymentStatus: 'completed', // Default payment status
      deliveryDate,
      status: 'ordered', // Default status
    });

    // Save the order to the database
    await newOrder.save();

    // Return a success response with the created order and total price
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
      totalPrice: totalPrice, // Return the calculated total price
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'An error occurred while creating the order.' });
  }
};
exports.orderList = async (req, res) => {
    try {
      // Retrieve all orders and populate user, company, and item details
      const orders = await Order.find()
        .populate({
          path: 'userId',
          select: 'name fullName email phoneNumber companyId',
          populate: {
            path: 'companyId',
            select: 'name address contactNumber'
          }
        })
        .populate({
          path: 'items.itemId',
          select: 'itemName price' // Select itemName and price fields
        });
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found.' });
      }
  
      // Format the response data
      const formattedOrders = orders.map(order => ({
        orderId: order._id,
        userId: {
          _id: order.userId._id,
          name: order.userId.name,
          fullName: order.userId.fullName, // Include fullName
          email: order.userId.email,
          phoneNumber: order.userId.phoneNumber, // Include phoneNumber
          companyId: order.userId.companyId ? {
            _id: order.userId.companyId._id,
            name: order.userId.companyId.name,
            address: order.userId.companyId.address,
            contactNumber: order.userId.companyId.contactNumber
          } : null
        },
        items: order.items.map(item => ({
          itemId: item.itemId._id,
          name: item.itemId.itemName, // Include itemName
          price: item.itemId.price, // Include item price
          quantity: item.quantity,
          extras: item.extras
        })),
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryDate: order.deliveryDate, // Changed from deliveryTime to deliveryDate
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
  
      // Send response with orders in the requested format
      res.status(200).json({
        message: 'Orders fetched successfully',
        orders: formattedOrders
      });
    } catch (err) {
      console.error('Error fetching order list:', err);
      res.status(500).json({ message: 'An error occurred while fetching the order list.' });
    }
  };

  
  exports.orderInsight = async (req, res) => {
    try {
      // Fetch data for the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      const ordersToday = await Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      });
  
      // Fetch data for the current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
  
      const ordersThisWeek = await Order.countDocuments({
        createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      });
  
      // Fetch data for the current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
      const ordersThisMonth = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });
  
      // Fetch total revenue (assuming you have a 'totalPrice' field in orders)
      const totalRevenue = await Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }, // Replace with your order total field
          },
        },
      ]);
  
      // Fetch total companies and employees
      const totalCompanies = await Company.countDocuments();
      const totalEmployees = await Employee.countDocuments();
  
      // Fetch recent orders (latest 5) with user details and companyName populated
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'userId', // Replace with the actual field name in your Order schema that references the User model
          select: 'fullName email phoneNumber companyId', // Select necessary fields from User
          populate: {
            path: 'companyId', // Assuming User references Company via companyId
            select: 'name', // Fetch companyName from the Company model
          },
        });
  
      // Fetch average rating and total review count from Feedback model
      const feedbackStats = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }, // Replace 'rating' with your actual rating field
            totalReviews: { $sum: 1 },
          },
        },
      ]);
  
      // Prepare the response with populated recent orders
      const formattedRecentOrders = recentOrders.map(order => ({
        employeeName: order.userId?.fullName || 'N/A',
        emailAddress: order.userId?.email || 'N/A',
        phoneNumber: order.userId?.phoneNumber || 'N/A',
        companyName: order.userId?.companyId?.name || 'N/A',
        createdAt: order.createdAt,
      }));
  
      res.status(200).json({
        numberOfOrdersToday: ordersToday,
        numberOfOrdersThisWeek: ordersThisWeek,
        numberOfOrdersThisMonth: ordersThisMonth,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCompanies,
        totalEmployees,
        recentOrders: formattedRecentOrders,
        averageReview: feedbackStats[0]?.averageRating || 0,
        reviewCount: feedbackStats[0]?.totalReviews || 0,
      });
    } catch (error) {
      console.error('Error fetching order insights:', error);
      res.status(500).json({ message: 'An error occurred while fetching order insights.' });
    }
  };
  
  