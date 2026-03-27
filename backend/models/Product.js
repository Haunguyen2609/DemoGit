const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  isNew: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
