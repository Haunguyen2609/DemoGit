const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST create order
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestName, guestEmail, note, user } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ success: false, message: `Sản phẩm ${item.productId} không tồn tại` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${product.name}" không đủ hàng` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity
      });
      totalAmount += product.price * item.quantity;

      // Update stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    const shippingFee = totalAmount >= 500000 ? 0 : 30000;

    const order = await Order.create({
      user: user || undefined,
      guestName, guestEmail,
      items: orderItems,
      totalAmount,
      shippingFee,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      note
    });

    res.status(201).json({ success: true, data: order, message: 'Đặt hàng thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET order by id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
