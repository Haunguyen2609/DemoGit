const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, isNew, isSale } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (isNew) query.isNew = true;
    if (isSale) query.isSale = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'popular') sortObj = { sold: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      data: products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
