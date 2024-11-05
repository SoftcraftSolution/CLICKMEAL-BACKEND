const MenuItem=require('../model/item.model')
const Cart=require('../model/cart.model')
const User=require('../model/user.model')

exports.addToCart = async (req, res) => {
    const { userId, itemId, quantity } = req.body;
  
    try {
      // Check if the item exists
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found.' });
      }
  
      // Create a new cart item
      const newCartItem = new Cart({
        userId,
        itemId,
        quantity,
      });
  
      await newCartItem.save();
      res.status(201).json({ message: 'Item added to cart successfully!', cartItem: newCartItem });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  
  // Get cart for a specific user
  exports.getCartByUserId = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const cartItems = await Cart.find({ userId }).populate('itemId'); // Populating itemId to get full item details
      res.status(200).json({ cartItems });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  
  // Remove item from cart
  exports.removeFromCart = async (req, res) => {
    const { userId, itemId } = req.body;
  
    try {
      const removedItem = await Cart.findOneAndDelete({ userId, itemId });
      if (!removedItem) {
        return res.status(404).json({ message: 'Cart item not found.' });
      }
      res.status(200).json({ message: 'Item removed from cart successfully!' });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  };