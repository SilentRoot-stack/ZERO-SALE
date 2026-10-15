// ZERO T-Shirt Store Application Engine

const PRODUCTS = [
  {
    id: 1,
    name: "Aura Oversized Tee",
    category: "STREETWEAR",
    price: 48.00,
    originalPrice: 60.00,
    image: "assets/tshirt1.png",
    badge: "BESTSELLER",
    badgeClass: "badge-bestseller",
    description: "Architectural boxy fit crafted from 240 GSM heavy combed cotton. Features a holographic geometric aura chest print.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Cyberpunk Glitch Tee",
    category: "CYBERPUNK",
    price: 54.00,
    originalPrice: 70.00,
    image: "assets/tshirt2.png",
    badge: "LIMITED",
    badgeClass: "badge-limited",
    description: "Vibrant neon cyan & violet glitch artwork on obsidian black cotton. High-density tactile screenprint.",
    sizes: ["M", "L", "XL", "XXL"]
  },
  {
    id: 3,
    name: "Vintage Kanji Washed Tee",
    category: "VINTAGE",
    price: 45.00,
    originalPrice: 55.00,
    image: "assets/tshirt3.png",
    badge: "NEW",
    badgeClass: "badge-tag",
    description: "Off-white vintage acid washed 100% cotton with minimalist Japanese typography back print.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Acid Wash Graphic Boxy Tee",
    category: "VINTAGE",
    price: 50.00,
    originalPrice: 65.00,
    image: "assets/tshirt4.png",
    badge: "TRENDING",
    badgeClass: "badge-bestseller",
    description: "Dark charcoal vintage acid wash with bold front ZERO branding. Pre-shrunk drop shoulder aesthetic.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Obsidian Heavyweight Luxury Tee",
    category: "MINIMAL",
    price: 62.00,
    originalPrice: 78.00,
    image: "assets/tshirt5.png",
    badge: "LUXURY",
    badgeClass: "badge-tag",
    description: "Ultra-heavyweight 280 GSM luxury organic cotton featuring a chrome metallic ZERO emblem on left chest.",
    sizes: ["M", "L", "XL"]
  },
  {
    id: 6,
    name: "Neon Abstract Liquid Wave Tee",
    category: "CYBERPUNK",
    price: 52.00,
    originalPrice: 68.00,
    image: "assets/tshirt6.png",
    badge: "POPULAR",
    badgeClass: "badge-limited",
    description: "Deep navy heavyweight cotton featuring liquid neon wave graphics across front and shoulders.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  }
];

// App State
let currentUser = JSON.parse(localStorage.getItem('zero_user')) || null;
let cart = JSON.parse(localStorage.getItem('zero_cart')) || [];
let activeAuthMode = 'signin';
let selectedCategory = 'ALL';
let selectedSizes = {}; // { productId: 'M' }

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateAuthUI();
  updateCartUI();
});

// Render Products Grid
function renderProducts() {
  const container = document.getElementById('product-grid');
  if (!container) return;

  const filtered = selectedCategory === 'ALL' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  container.innerHTML = filtered.map(p => {
    const selectedSize = selectedSizes[p.id] || p.sizes[0];
    return `
      <div class="product-card">
        <div class="product-thumb">
          <span class="badge-tag ${p.badgeClass}">${p.badge}</span>
          <img src="${p.image}" alt="${p.name}" onclick="openQuickView(${p.id})">
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-title">${p.name}</h3>
          <div class="product-price-row">
            <span class="product-price">$${p.price.toFixed(2)} <span class="original-price">$${p.originalPrice.toFixed(2)}</span></span>
          </div>
          
          <div class="size-selector">
            ${p.sizes.map(s => `
              <button class="size-btn ${s === selectedSize ? 'selected' : ''}" onclick="selectSize(${p.id}, '${s}', event)">${s}</button>
            `).join('')}
          </div>

          <div class="card-actions">
            <button class="btn-add-cart" onclick="addToCart(${p.id})">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <button class="btn-buy-now" onclick="buyNowDirect(${p.id})">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Select Product Size
function selectSize(productId, size, event) {
  event.stopPropagation();
  selectedSizes[productId] = size;
  renderProducts();
}

// Filter Category
function filterCategory(cat, element) {
  selectedCategory = cat;
  document.querySelectorAll('.category-pills .pill').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
  renderProducts();
}

// Auth UI Updates
function updateAuthUI() {
  const authBtnText = document.getElementById('auth-btn-text');
  const authBtn = document.getElementById('auth-btn');

  if (currentUser) {
    authBtnText.textContent = `Hi, ${currentUser.username}`;
    authBtn.onclick = () => {
      if (confirm(`Logged in as ${currentUser.username}. Do you want to sign out?`)) {
        currentUser = null;
        localStorage.removeItem('zero_user');
        updateAuthUI();
        showToast('Successfully signed out.', 'success');
      }
    };
  } else {
    authBtnText.textContent = 'Sign In / Register';
    authBtn.onclick = () => openAuthModal('signin');
  }
}

// Open Auth Modal
function openAuthModal(mode = 'signin', promptReason = '') {
  activeAuthMode = mode;
  switchAuthTab(mode);
  
  if (promptReason) {
    document.getElementById('auth-subtitle').textContent = promptReason;
  } else {
    document.getElementById('auth-subtitle').textContent = mode === 'signin' 
      ? 'Sign in with your username & password to proceed.' 
      : 'Create a new account with your username & password.';
  }

  document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

// Switch Tab inside Auth Modal
function switchAuthTab(mode) {
  activeAuthMode = mode;
  const tabSignin = document.getElementById('tab-signin');
  const tabSignup = document.getElementById('tab-signup');
  const submitBtn = document.getElementById('auth-submit-btn');
  const title = document.getElementById('auth-title');
  const extraFields = document.getElementById('signup-extra-fields');

  if (mode === 'signin') {
    tabSignin.classList.add('active');
    tabSignup.classList.remove('active');
    title.textContent = 'Welcome Back to ZERO';
    submitBtn.textContent = 'Sign In';
    extraFields.style.display = 'none';
  } else {
    tabSignup.classList.add('active');
    tabSignin.classList.remove('active');
    title.textContent = 'Join ZERO Club';
    submitBtn.textContent = 'Create Account';
    extraFields.style.display = 'block';
  }
}

// Submit Auth Form
function handleAuthSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  const email = document.getElementById('auth-email').value.trim();

  if (!username || !password) {
    showToast('Please fill in both username and password!', 'error');
    return;
  }

  let accounts = JSON.parse(localStorage.getItem('zero_accounts')) || {};

  if (activeAuthMode === 'signup') {
    if (accounts[username]) {
      showToast('Username already exists! Please sign in.', 'error');
      switchAuthTab('signin');
      return;
    }
    accounts[username] = { password, email };
    localStorage.setItem('zero_accounts', JSON.stringify(accounts));
    currentUser = { username, email };
    localStorage.setItem('zero_user', JSON.stringify(currentUser));
    showToast(`Account created! Welcome, ${username}`, 'success');
  } else {
    // Sign In
    if (accounts[username]) {
      if (accounts[username].password !== password) {
        showToast('Incorrect password. Please try again.', 'error');
        return;
      }
      currentUser = { username, email: accounts[username].email };
    } else {
      // Automatic initial sign-in registration helper
      accounts[username] = { password, email };
      localStorage.setItem('zero_accounts', JSON.stringify(accounts));
      currentUser = { username, email };
    }
    localStorage.setItem('zero_user', JSON.stringify(currentUser));
    showToast(`Welcome back, ${username}!`, 'success');
  }

  updateAuthUI();
  closeAuthModal();

  // If items in cart, auto-trigger checkout if they were attempting to buy
  if (cart.length > 0) {
    toggleCartDrawer(true);
  }
}

// Add Item To Cart
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const size = selectedSizes[productId] || product.sizes[0];
  const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === size);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ ...product, size, quantity: 1 });
  }

  localStorage.setItem('zero_cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`Added ${product.name} (${size}) to cart!`, 'success');
}

// Direct Buy Now Flow (Enforces Sign Up / Sign In!)
function buyNowDirect(productId) {
  addToCart(productId);

  // Check if visitor is signed up / logged in
  if (!currentUser) {
    showToast('⚠️ Please sign up or log in before buying!', 'error');
    openAuthModal('signup', 'You must create an account or sign in to complete your purchase!');
  } else {
    toggleCartDrawer(true);
  }
}

// Cart UI Management
function updateCartUI() {
  const countBadge = document.getElementById('cart-badge');
  const listContainer = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = totalItems;

  if (!listContainer) return;

  if (cart.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-dark); padding: 40px 10px;">
        <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; margin-bottom: 12px;"></i>
        <p>Your cart is empty.</p>
      </div>
    `;
    subtotalEl.textContent = '$0.00';
    totalEl.textContent = '$0.00';
    return;
  }

  let total = 0;
  listContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">Size: ${item.size} • Qty: ${item.quantity}</div>
          <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  }).join('');

  subtotalEl.textContent = `$${total.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('zero_cart', JSON.stringify(cart));
  updateCartUI();
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  if (open === true) {
    drawer.classList.add('open');
  } else if (open === false) {
    drawer.classList.remove('open');
  } else {
    drawer.classList.toggle('open');
  }
}

// Checkout Action (Strict Sign up / Log in Guard)
function handleCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  // MANDATORY REQUIREMENT: Must be logged in
  if (!currentUser) {
    toggleCartDrawer(false);
    showToast('Please sign up or log in to buy T-shirts!', 'error');
    openAuthModal('signup', 'Visitors MUST sign up with a username and password before completing purchases!');
    return;
  }

  // User is logged in: Process Checkout Success
  const orderId = '#ZERO-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('success-username').textContent = currentUser.username;
  document.getElementById('success-order-id').textContent = orderId;

  // Clear Cart
  cart = [];
  localStorage.removeItem('zero_cart');
  updateCartUI();
  toggleCartDrawer(false);

  // Show Order Success Receipt Modal
  document.getElementById('success-modal').classList.add('active');
}

function closeSuccessModal() {
  document.getElementById('success-modal').classList.remove('active');
}

// Quick View Modal
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const quickviewContent = document.getElementById('quickview-content');
  quickviewContent.innerHTML = `
    <div style="flex: 1; min-width: 240px;">
      <img src="${product.image}" style="width: 100%; border-radius: 14px; border: 1px solid var(--border-color);" alt="${product.name}">
    </div>
    <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; justify-content: center;">
      <span style="color: var(--accent-purple); font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">${product.category}</span>
      <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; color: #fff; margin: 4px 0 10px;">${product.name}</h2>
      <div style="font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 14px;">$${product.price.toFixed(2)}</div>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.6;">${product.description}</p>
      <button class="btn-primary" onclick="addToCart(${product.id}); closeQuickViewModal();">
        <i class="fa-solid fa-cart-plus"></i> Add to Cart
      </button>
    </div>
  `;

  document.getElementById('quickview-modal').classList.add('active');
}

function closeQuickViewModal() {
  document.getElementById('quickview-modal').classList.remove('active');
}

// Toast Notifications Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
