const Order = require('../model/order.model'); // Assuming the Order model is in the 'models' directory
const MenuItem = require('../model/item.model'); // Assuming MenuItem model is in the 'models' directory

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

  