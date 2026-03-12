const CART_KEY = 'crunchCookiesCart';
const DARK_MODE_KEY = 'crunchCookiesDarkMode';

function getCart() {
  const data = localStorage.getItem(CART_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Invalid cart data, resetting', e);
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  document.querySelectorAll('#cartCount').forEach(el => (el.textContent = total));
}

function addToCart(name, price) {
  const cart = getCart();
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.subtotal = existingItem.quantity * existingItem.price;
  } else {
    cart.push({ name, price, quantity: 1, subtotal: price });
  }

  saveCart(cart);
  updateCartCount();
}

function flyToCart(event, name, price) {
  event.preventDefault();

  addToCart(name, price);

  const button = event.currentTarget;
  if (!button) return;

  const originalText = button.innerText;

  button.innerText = "Added ✓";
  button.disabled = true;

  setTimeout(() => {
    button.innerText = originalText;
    button.disabled = false;
  }, 550);
}

function displayCart() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('total');

  if (!list || !totalEl) return;

  const cart = getCart();

  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<li>Your cart is empty.</li>';
    totalEl.textContent = 'Total: ₹0';
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {

    total += item.subtotal;

    const li = document.createElement('li');

    li.innerHTML = `
      <strong>${item.name}</strong> 
      <span>₹${item.price}</span>
      <span>x ${item.quantity}</span> 
      <span>= ₹${item.subtotal}</span>
      <button class="remove-item" data-index="${index}">Remove</button>
    `;

    list.appendChild(li);
  });

  totalEl.textContent = `Total: ₹${total}`;

  list.querySelectorAll('.remove-item').forEach(btn => {

    btn.addEventListener('click', e => {

      const idx = Number(e.target.dataset.index);

      removeFromCart(idx);

      displayCart();

    });

  });
}

function removeFromCart(index) {

  const cart = getCart();

  if (index < 0 || index >= cart.length) return;

  cart.splice(index, 1);

  saveCart(cart);

  updateCartCount();
}

function clearCart() {

  localStorage.removeItem(CART_KEY);

  updateCartCount();

  displayCart();
}

function searchProduct(query) {

  const normalized = query.trim().toLowerCase();

  document.querySelectorAll('.products .card').forEach(card => {

    const title = (card.querySelector('h3')?.textContent || '').toLowerCase();

    const tags = (card.className || '').toLowerCase();

    const match =
      normalized === '' ||
      title.includes(normalized) ||
      tags.includes(normalized);

    card.style.display = match ? 'block' : 'none';
  });
}

function filter(category) {

  document.querySelectorAll('.products .card').forEach(card => {

    const isVisible =
      category === 'all' || card.classList.contains(category);

    card.style.display = isVisible ? 'block' : 'none';
  });
}

function loadDarkMode() {

  const saved = localStorage.getItem(DARK_MODE_KEY);

  if (saved === 'on') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function toggleDark() {

  document.body.classList.toggle('dark');

  const isDark = document.body.classList.contains('dark');

  localStorage.setItem(DARK_MODE_KEY, isDark ? 'on' : 'off');
}

window.addEventListener('DOMContentLoaded', () => {

  loadDarkMode();

  updateCartCount();

  displayCart();

});