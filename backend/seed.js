require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/vi');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const categories = [
  { name: 'Điện tử', slug: 'dien-tu', icon: '📱', description: 'Điện thoại, laptop, tablet và phụ kiện công nghệ' },
  { name: 'Thời trang', slug: 'thoi-trang', icon: '👗', description: 'Quần áo, giày dép, túi xách thời thượng' },
  { name: 'Gia dụng', slug: 'gia-dung', icon: '🏠', description: 'Thiết bị gia đình, nội thất, đồ dùng nhà bếp' },
  { name: 'Sách & Văn phòng', slug: 'sach-van-phong', icon: '📚', description: 'Sách, dụng cụ học tập và văn phòng phẩm' },
  { name: 'Thể thao', slug: 'the-thao', icon: '⚽', description: 'Dụng cụ thể thao, quần áo tập luyện, giày thể thao' },
  { name: 'Làm đẹp', slug: 'lam-dep', icon: '💄', description: 'Mỹ phẩm, chăm sóc da, nước hoa cao cấp' },
  { name: 'Đồ chơi', slug: 'do-choi', icon: '🧸', description: 'Đồ chơi giáo dục, mô hình, trò chơi' },
  { name: 'Thực phẩm', slug: 'thuc-pham', icon: '🍜', description: 'Thực phẩm sạch, đặc sản vùng miền, đồ ăn vặt' }
];

const productTemplates = {
  'dien-tu': ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'MacBook Pro M3', 'iPad Air', 'Tai nghe Sony WH-1000XM5', 'Màn hình LG 4K', 'Chuột Logitech MX', 'Bàn phím Keychron K3', 'Sạc nhanh 65W GaN', 'Ổ cứng SSD 1TB'],
  'thoi-trang': ['Áo thun cotton unisex', 'Quần jeans slim fit', 'Váy maxi hoa', 'Áo khoác bomber', 'Giày sneaker trắng', 'Túi tote canvas', 'Áo sơ mi Oxford', 'Quần shorts chạy bộ', 'Đầm cocktail', 'Áo hoodie vintage'],
  'gia-dung': ['Nồi chiên không dầu 5L', 'Máy lọc không khí', 'Robot hút bụi thông minh', 'Bếp từ đôi', 'Máy pha cà phê espresso', 'Tủ lạnh side-by-side', 'Lò vi sóng inverter', 'Bình lọc nước RO', 'Đèn LED thông minh', 'Máy sấy quần áo'],
  'sach-van-phong': ['Đắc Nhân Tâm', 'Nghĩ Giàu Làm Giàu', 'Nhà Giả Kim', 'Bút Parker Jotter', 'Sổ tay Moleskine', 'Bộ highlight Stabilo', 'File tài liệu A4', 'Máy tính Casio FX', 'Giá đỡ laptop gỗ', 'Bàn làm việc đứng'],
  'the-thao': ['Tạ tay 5kg', 'Thảm yoga 6mm', 'Giày chạy bộ Adidas', 'Găng tay boxing', 'Dây nhảy cao su', 'Bình nước thể thao', 'Áo thể thao Dri-Fit', 'Kính bơi Speedo', 'Vợt cầu lông Yonex', 'Ba lô leo núi 40L'],
  'lam-dep': ['Son môi Chanel Rouge', 'Kem dưỡng da Laneige', 'Nước hoa Versace Eros', 'Serum vitamin C', 'Mặt nạ đất sét', 'Mascara Maybelline', 'Tẩy trang Bioderma', 'Kem chống nắng SPF50+', 'Oil dưỡng tóc Pantene', 'Phấn nền Innisfree'],
  'do-choi': ['Lego Technic', 'Robot điều khiển', 'Búp bê Barbie Dream', 'Xe đua mini 4WD', 'Bộ xếp hình 1000 mảnh', 'Máy bay drone mini', 'Bộ đồ chơi nấu ăn', 'Súng bắn bong bóng', 'Game board Catan', 'Mô hình Gundam'],
  'thuc-pham': ['Cà phê Moka rang xay', 'Trà oolong Đà Lạt', 'Bánh tráng me Tây Ninh', 'Mật ong rừng nguyên chất', 'Hạt macadamia Úc', 'Phô mai Laughing Cow', 'Socola Lindt 85%', 'Yến sào thiên nhiên', 'Dầu olive Extra Virgin', 'Sữa tươi Organic']
};

const generateProducts = (categories) => {
  const products = [];
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.slug] = c._id; });

  let count = 0;
  for (const [slug, names] of Object.entries(productTemplates)) {
    const catId = categoryMap[slug];
    if (!catId) continue;

    names.forEach((baseName) => {
      // Generate 2-3 variants per product name
      const variants = Math.floor(Math.random() * 2) + 1;
      for (let v = 0; v < variants; v++) {
        const basePrice = Math.floor(Math.random() * 4500000) + 49000;
        const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : 0;
        const originalPrice = discount > 0 ? Math.round(basePrice / (1 - discount / 100)) : null;
        const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
        const stock = Math.floor(Math.random() * 200) + 10;
        const sold = Math.floor(Math.random() * 1000);
        const isNew = Math.random() > 0.7;
        const isSale = discount > 0;

        // Random image from picsum
        const imgId = Math.floor(Math.random() * 800) + 100;
        products.push({
          name: v > 0 ? `${baseName} - Phiên bản ${v + 1}` : baseName,
          description: `${baseName} - Sản phẩm chất lượng cao với thiết kế hiện đại. Được sản xuất từ vật liệu cao cấp, bền đẹp và phù hợp với mọi nhu cầu sử dụng hàng ngày. Được kiểm định chất lượng nghiêm ngặt trước khi đến tay người tiêu dùng.`,
          price: basePrice,
          originalPrice: originalPrice,
          category: catId,
          images: [
            `https://picsum.photos/seed/${imgId}/600/600`,
            `https://picsum.photos/seed/${imgId + 1}/600/600`,
            `https://picsum.photos/seed/${imgId + 2}/600/600`
          ],
          stock,
          sold,
          rating,
          reviewCount: Math.floor(Math.random() * 500) + 10,
          tags: [slug, baseName.toLowerCase().split(' ')[0], 'chất lượng', 'hot'],
          isNew,
          isSale,
          isActive: true
        });
        count++;
      }
    });
  }
  console.log(`📦 Chuẩn bị tạo ${count} sản phẩm...`);
  return products;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Tạo ${createdCategories.length} danh mục`);

    // Create products
    const productData = generateProducts(createdCategories);
    const createdProducts = await Product.insertMany(productData);
    console.log(`✅ Tạo ${createdProducts.length} sản phẩm`);

    // Update category product count
    for (const cat of createdCategories) {
      const count = createdProducts.filter(p => p.category.toString() === cat._id.toString()).length;
      await Category.findByIdAndUpdate(cat._id, { productCount: count });
    }

    // Create admin user
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@shopdb.vn',
      password: adminPass,
      role: 'admin'
    });

    // Create demo user
    const demoPass = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Người Dùng Demo',
      email: 'demo@shopdb.vn',
      password: demoPass,
      role: 'user'
    });

    console.log('\n🎉 Seed database thành công!');
    console.log('📊 Tổng kết:');
    console.log(`   - Danh mục: ${createdCategories.length}`);
    console.log(`   - Sản phẩm: ${createdProducts.length}`);
    console.log(`   - Admin: admin@shopdb.vn / admin123`);
    console.log(`   - User demo: demo@shopdb.vn / user123`);
    console.log('\n🚀 Khởi động server: npm start\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed:', err.message);
    process.exit(1);
  }
};

seed();
