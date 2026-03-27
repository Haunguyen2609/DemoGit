const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String },
  guestEmail: { type: String },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, default: 30000 },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String
  },
  paymentMethod: { type: String, enum: ['cod', 'banking'], default: 'cod' },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
