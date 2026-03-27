const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Email không tồn tại' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Mật khẩu không đúng' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
