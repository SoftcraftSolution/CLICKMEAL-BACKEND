const MenuItem=require('../model/item.model')
const Cart=require('../model/cart.model')
const User=require('../model/user.model')

exports.addMultipleToCart = async (req, res) => {
    const { userId, items } = req.body; // items should be an array of { itemId, quantity }

    try {
        // Check if items array is provided
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items array is required.' });
        }

        // Prepare an array to hold the promises
        const promises = items.map(async ({ itemId, quantity }) => {
            // Validate quantity
            if (quantity <= 0) {
                return { success: false, message: `Quantity must be greater than 0 for item ID ${itemId}.` };
            }

            // Check if the menu item exists
            const menuItem = await MenuItem.findById(itemId);
            if (!menuItem) {
                return { success: false, message: `Menu item with ID ${itemId} not found.` };
            }

            // Check if the item is already in the cart for the user
            let cartItem = await Cart.findOne({ userId, itemId });

            if (cartItem) {
                // Item exists in the cart, update the quantity
                cartItem.quantity += quantity; // Increment the quantity
                await cartItem.save();
                return { success: true, cartItem };
            } else {
                // Create a new cart item
                const newCartItem = new Cart({
                    userId,
                    itemId,
                    quantity,
                });
                await newCartItem.save();
                return { success: true, cartItem: newCartItem };
            }
        });

        // Execute all promises
        const results = await Promise.all(promises);

        // Filter out any unsuccessful attempts
        const failedItems = results.filter(result => !result.success);
        if (failedItems.length > 0) {
            return res.status(400).json({ message: 'Some items could not be added.', errors: failedItems });
        }

        res.status(201).json({ message: 'Items added to cart successfully!', results });
    } catch (error) {
        console.error('Error adding items to cart:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};


  
  // Get cart for a specific user
 // Get cart for a specific user
exports.getCartByUserId = async (req, res) => {
    const { userId } = req.query;

    try {
        const cartItems = await Cart.find({ userId }).populate('itemId'); // Populating itemId to get full item details

        // Calculate total price and item count
        let totalPrice = 0;
        let itemCount = 0;

        cartItems.forEach(cartItem => {
            const itemPrice = cartItem.itemId.price; // Assuming `price` is a field in the Item model
            const quantity = cartItem.quantity;
            totalPrice += itemPrice * quantity; // Update total price
            itemCount += quantity; // Update item count
        });

        res.status(200).json({ cartItems, totalPrice, itemCount });
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