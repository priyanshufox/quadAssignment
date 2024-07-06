// routes/cart.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const authenticate = require('../middleware/authMiddleware');

// GET /cart: Retrieve the user's shopping cart
router.get('/cart', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /cart: Add an item to the cart
router.post('/cart', authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    const cartItemIndex = user.cart.findIndex(item => item.product.equals(productId));
    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.status(201).json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cart/:id: Remove an item from the cart
router.delete('/cart/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => !item.product.equals(req.params.id));
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
