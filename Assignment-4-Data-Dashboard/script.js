const CART_KEY = "crunchCookiesCart";
const DARK_MODE_KEY = "crunchCookiesDarkMode";
const ORDER_KEY = "crunchCookiesOrders";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function getCart() {
  const data = localStorage.getItem(CART_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (error) {
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
  document.querySelectorAll("#cartCount").forEach((element) => {
    element.textContent = total;
  });
}

function addToCart(name, price) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.name === name);

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
  const originalText = button.textContent;
  button.textContent = "Added";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 700);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
  displayCart();
}

function getCategory(name) {
  const value = name.toLowerCase();
  if (value.includes("chocolate") || value.includes("choco")) return "Chocolate";
  if (value.includes("red velvet") || value.includes("nutella")) return "Premium";
  if (value.includes("oat") || value.includes("almond")) return "Healthy";
  return "Other";
}

function placeOrder() {
  const cart = getCart();

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  let orders = JSON.parse(localStorage.getItem(ORDER_KEY)) || [];

  cart.forEach((item) => {
    orders.push({
      product: item.name,
      price: item.price,
      quantity: item.quantity,
      category: getCategory(item.name),
      date: new Date().toISOString().split("T")[0]
    });
  });

  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  clearCart();
  showSuccessPopup();
}

function showSuccessPopup() {
  const popup = document.getElementById("successPopup");
  if (!popup) return;

  popup.style.display = "flex";

  setTimeout(() => {
    window.location.href = "dashboard/index.html";
  }, 1800);
}

function displayCart() {
  const list = document.getElementById("cartItems");
  const totalElement = document.getElementById("total");
  const summaryCount = document.getElementById("summaryCount");

  if (!list || !totalElement) return;

  const cart = getCart();

  if (!cart.length) {
    list.innerHTML = `
      <li class="cart-item cart-empty">
        <div class="cart-item-meta">
          <h3>Your cart is empty</h3>
          <p>Add cookies from the menu to start building your order.</p>
        </div>
      </li>
    `;
    totalElement.textContent = "Total: Rs 0";
    if (summaryCount) summaryCount.textContent = "0";
    return;
  }

  let total = 0;
  let quantityCount = 0;

  list.innerHTML = cart.map((item, index) => {
    total += item.subtotal;
    quantityCount += item.quantity;

    return `
      <li class="cart-item">
        <div class="cart-item-meta">
          <h3>${item.name}</h3>
          <p>${formatCurrency(item.price)} each</p>
          <strong>${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.subtotal)}</strong>
        </div>
        <button class="remove-item" type="button" data-index="${index}">Remove</button>
      </li>
    `;
  }).join("");

  totalElement.textContent = `Total: ${formatCurrency(total)}`;
  if (summaryCount) summaryCount.textContent = String(quantityCount);

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.onclick = (event) => {
      removeFromCart(Number(event.currentTarget.dataset.index));
      displayCart();
    };
  });
}

function searchProduct(query) {
  const value = query.trim().toLowerCase();

  document.querySelectorAll(".products .product-item").forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(value) ? "" : "none";
  });
}

function filter(category, buttonElement) {
  document.querySelectorAll(".products .product-item").forEach((card) => {
    const shouldShow = category === "all" || card.classList.contains(category);
    card.style.display = shouldShow ? "" : "none";
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.remove("active");
  });

  if (buttonElement) {
    buttonElement.classList.add("active");
  }
}

function loadDarkMode() {
  const savedMode = localStorage.getItem(DARK_MODE_KEY);
  if (savedMode === "on") {
    document.body.classList.add("dark");
  }
}

function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    DARK_MODE_KEY,
    document.body.classList.contains("dark") ? "on" : "off"
  );
}

window.onload = () => {
  loadDarkMode();
  updateCartCount();
  displayCart();
};
