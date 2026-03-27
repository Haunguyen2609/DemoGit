const API_BASE = 'http://localhost:5000/api';

const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
  },
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
  }
};

const cart = {
  get() { return JSON.parse(localStorage.getItem('cart') || '[]'); },
  save(items) { localStorage.setItem('cart', JSON.stringify(items)); window.dispatchEvent(new Event('cartUpdate')); },
  add(product, qty = 1) {
    const items = this.get();
    const idx = items.findIndex(i => i._id === product._id);
    if (idx > -1) items[idx].qty = Math.min(items[idx].qty + qty, product.stock);
    else items.push({ _id: product._id, name: product.name, price: product.price, image: product.images[0], stock: product.stock, qty });
    this.save(items);
    toast('success', '✅ Đã thêm vào giỏ hàng!');
  },
  remove(id) { this.save(this.get().filter(i => i._id !== id)); },
  updateQty(id, qty) {
    const items = this.get().map(i => i._id === id ? { ...i, qty } : i).filter(i => i.qty > 0);
    this.save(items);
  },
  total() { return this.get().reduce((sum, i) => sum + i.price * i.qty, 0); },
  count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
  clear() { this.save([]); }
};

const auth = {
  get() { return JSON.parse(localStorage.getItem('user') || 'null'); },
  save(user, token) { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('token', token); },
  clear() { localStorage.removeItem('user'); localStorage.removeItem('token'); },
  isLoggedIn() { return !!this.get(); }
};

function toast(type, msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function formatPrice(p) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p); }

function renderStars(rating) {
  const full = Math.floor(rating); const half = rating % 1 >= 0.5;
  let s = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  return s;
}

function updateCartBadge() {
  const el = document.getElementById('cart-badge');
  const count = cart.count();
  if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
}

function renderNavbar(activePage = '') {
  const user = auth.get();
  return `
  <nav class="navbar">
    <a href="index.html" class="navbar-brand">
      <div class="logo">🛒</div>
      <span>SHO</span>
    </a>
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input type="text" id="nav-search" placeholder="Tìm kiếm sản phẩm...">
      <button onclick="doSearch()">Tìm</button>
    </div>
    <div class="navbar-actions">
      <a href="cart.html" class="nav-btn cart" id="cart-nav-btn">
        🛒 Giỏ hàng
        <span class="cart-badge" id="cart-badge">0</span>
      </a>
      ${user
        ? `<button class="nav-btn" onclick="handleLogout()">👋 ${user.name.split(' ').pop()}</button>`
        : `<a href="login.html" class="nav-btn ${activePage === 'login' ? 'primary' : ''}">Đăng nhập</a>
           <a href="register.html" class="nav-btn primary">Đăng ký</a>`
      }
    </div>
  </nav>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:16px">🛒</div>
          <strong>SHO</strong>
        </div>
        <p>Nền tảng mua sắm trực tuyến hàng đầu Việt Nam với hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.</p>
      </div>
      <div>
        <div class="footer-title">Sản phẩm</div>
        <ul class="footer-links">
          <li><a href="index.html">Tất cả sản phẩm</a></li>
          <li><a href="index.html?isSale=true">Khuyến mãi</a></li>
          <li><a href="index.html?isNew=true">Hàng mới về</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-title">Tài khoản</div>
        <ul class="footer-links">
          <li><a href="login.html">Đăng nhập</a></li>
          <li><a href="register.html">Đăng ký</a></li>
          <li><a href="cart.html">Giỏ hàng</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-title">Hỗ trợ</div>
        <ul class="footer-links">
          <li><a href="#">Liên hệ</a></li>
          <li><a href="#">Chính sách đổi trả</a></li>
          <li><a href="#">Hướng dẫn mua hàng</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 ShopDB. Bản quyền thuộc về ShopDB Vietnam.</p>
      <p style="font-size:0.75rem;color:var(--text-muted)">Powered by Node.js + MongoDB</p>
    </div>
  </footer>`;
}

function doSearch() {
  const val = document.getElementById('nav-search')?.value?.trim();
  if (val) window.location.href = `index.html?search=${encodeURIComponent(val)}`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'nav-search') doSearch();
});

function handleLogout() {
  auth.clear();
  window.location.href = 'index.html';
}

window.addEventListener('cartUpdate', updateCartBadge);
window.addEventListener('DOMContentLoaded', updateCartBadge);
