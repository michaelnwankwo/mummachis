"use strict";

// Constants
const MAX_ITEMS = 10;
const DELIVERY_FEE = 500;
const NON_SWALLOW_DISHES = [
  "rice",
  "jollof rice",
  "fried rice",
  "ofada rice",
  "beans",
  "moi moi",
  "salad",
  "plantain",
  "yam",
  "Rice / banga stew (ofe akwu)",
];

// DOM Elements
const orderItems = document.getElementById("orderItems");
const orderForm = document.getElementById("orderForm");
const addFirstItemBtn = document.getElementById("addFirstItemBtn");
const addMoreBtn = document.getElementById("addMoreBtn");
const notesInput = document.getElementById("notes");
const orderloInput = document.getElementById("orderlo");
const ordernaInput = document.getElementById("ordernam");
const subtotalElement = document.getElementById("subtotal");
const totalAmountElement = document.getElementById("totalAmount");

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  createOrderRow();
  toggleButtons();
  setupMobileNav();
});

// Menu Utilities
function buildMenuOptions(selected = "") {
  return window.menuItems
    .map(
      ({ name, price }) => `
      <option value="${name}" data-price="${price}" ${
        name === selected ? "selected" : ""
      }>
        ${name} – ₦${price.toLocaleString()}
      </option>`
    )
    .join("");
}

function getSwallowOptionsForSoup(soupName) {
  const swallowMap = {
    "Egusi Soup": ["Pounded Yam", "Eba", "Fufu"],
    "Okra Soup": ["Amala", "Eba", "Fufu"],
    "Oha Soup": ["Pounded Yam", "Fufu"],
    "Banga Soup": ["Starch", "Fufu"],
    "Afang Soup": ["Eba", "Fufu"],
    "Ogbono Soup": ["Pounded Yam", "Eba"],
    "Vegetable Soup": ["Eba", "Fufu"],
  };
  return (
    swallowMap[soupName] || ["Pounded Yam", "Fufu", "Eba", "Semolina", "Wheat"]
  );
}

function isSoupDish(dishName) {
  const lowerDish = dishName.toLowerCase();
  return (
    lowerDish.includes("soup") &&
    !NON_SWALLOW_DISHES.some((dish) => lowerDish.includes(dish.toLowerCase()))
  );
}

// Order Item Management
function createOrderRow(dishName = "", quantity = 1) {
  if (orderItems.children.length >= MAX_ITEMS) {
    alert(`You can order up to ${MAX_ITEMS} different dishes.`);
    return;
  }

  const row = document.createElement("div");
  row.className = "order-item";
  const showSwallow = isSoupDish(dishName);

  row.innerHTML = `
    <div class="form-group">
      <select class="form-control dish-select" required>
        <option value="" disabled ${
          !dishName ? "selected" : ""
        }>Select a dish</option>
        ${buildMenuOptions(dishName)}
      </select>
    </div>
    <div class="form-group">
      <input type="number" class="form-control qty-input" min="1" value="${quantity}" required />
    </div>
    <div class="form-group">
      <select class="form-control swallow-select" ${
        showSwallow ? "" : "disabled"
      }>
        <option value="">No swallow</option>
        ${
          showSwallow
            ? getSwallowOptionsForSoup(dishName)
                .map(
                  (swallow) => `<option value="${swallow}">${swallow}</option>`
                )
                .join("")
            : ""
        }
      </select>
    </div>
    <button type="button" class="remove-item">×</button>
  `;

  row.querySelector(".remove-item").addEventListener("click", () => {
    row.remove();
    updateTotals();
    toggleButtons();
  });

  row.querySelector(".dish-select").addEventListener("change", (e) => {
    updateSwallowSelect(e.target);
    updateTotals();
  });

  // Initialize swallow select state for pre-selected dishes
  if (dishName) {
    const swallowSelect = row.querySelector(".swallow-select");
    if (!showSwallow) {
      swallowSelect.innerHTML = '<option value="">No swallow</option>';
      swallowSelect.disabled = true;
    }
  }

  orderItems.appendChild(row);
  updateTotals();
  toggleButtons();
}

function updateSwallowSelect(selectEl) {
  const dishName = selectEl.value;
  const container = selectEl.closest(".order-item");
  const swallowSelect = container.querySelector(".swallow-select");
  const shouldShowSwallow = isSoupDish(dishName);

  if (shouldShowSwallow) {
    const options = getSwallowOptionsForSoup(dishName)
      .map((swallow) => `<option value="${swallow}">${swallow}</option>`)
      .join("");
    swallowSelect.innerHTML = `<option value="">No swallow</option>${options}`;
    swallowSelect.disabled = false;
  } else {
    swallowSelect.innerHTML = `<option value="">No swallow</option>`;
    swallowSelect.disabled = true;
  }
}

// Calculation Functions
function updateTotals() {
  const rows = orderItems.querySelectorAll(".order-item");
  let subtotal = 0;

  rows.forEach((row) => {
    const dish = row.querySelector(".dish-select").value;
    const qty = parseInt(row.querySelector(".qty-input").value) || 0;
    const menuItem = window.menuItems.find((item) => item.name === dish);
    if (menuItem) subtotal += menuItem.price * qty;
  });

  subtotalElement.textContent = `₦${subtotal.toLocaleString()}`;
  totalAmountElement.textContent = `₦${(
    subtotal + DELIVERY_FEE
  ).toLocaleString()}`;
}

function toggleButtons() {
  const hasItems = orderItems.children.length > 0;
  addFirstItemBtn.style.display = hasItems ? "none" : "inline-block";
  addMoreBtn.style.display = hasItems ? "inline-block" : "none";
}

// Event Handlers
function handleAddToCartClick(e) {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const dishName = card.querySelector("h3")?.textContent.trim();
  if (dishName) addDishToOrder(dishName);
}

function addDishToOrder(dishName) {
  const existing = [...orderItems.querySelectorAll(".order-item")].find(
    (row) => {
      return row.querySelector(".dish-select")?.value === dishName;
    }
  );

  if (existing) {
    const qtyInput = existing.querySelector(".qty-input");
    qtyInput.value = +qtyInput.value + 1;
    updateTotals();
  } else {
    createOrderRow(dishName, 1);
  }

  toggleButtons();
  scrollToOrderSection();
  showAddToCartToast(dishName);
}

function scrollToOrderSection() {
  const orderSection = document.getElementById("order");
  if (orderSection) {
    const top = orderSection.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function showAddToCartToast(dishName) {
  const toast = document.createElement("div");
  toast.className = "add-to-cart-confirmation";
  toast.textContent = `${dishName} added to order`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => toast.classList.remove("show"), 2000);
  toast.addEventListener("transitionend", () => toast.remove());
}

// Mobile Navigation
function setupMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector("header");

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    const icon = hamburger.querySelector("i");
    icon?.classList.toggle("fa-bars");
    icon?.classList.toggle("fa-times");
  });

  navLinks?.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      hamburger?.classList.remove("active");
      navLinks?.classList.remove("active");
      const icon = hamburger?.querySelector("i");
      icon?.classList.add("fa-bars");
      icon?.classList.remove("fa-times");
    }
  });

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// Form Submission
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (orderItems.children.length === 0) {
    alert("Add at least one item to your order.");
    return;
  }

  let message =
    "Hello Mummachis Kitchen! I would like to place an order:%0A%0A";
  let subtotal = 0;

  orderItems.querySelectorAll(".order-item").forEach((row, i) => {
    const dish = row.querySelector(".dish-select").value;
    const qty = parseInt(row.querySelector(".qty-input").value) || 0;
    const swallow = row.querySelector(".swallow-select").value;
    const menuItem = window.menuItems.find((item) => item.name === dish);

    if (!dish || qty < 1 || !menuItem) return;

    const itemTotal = menuItem.price * qty;
    subtotal += itemTotal;

    message += `${i + 1}. ${dish} x${qty} – ₦${itemTotal.toLocaleString()}`;
    if (swallow) message += ` with ${swallow}`;
    message += "%0A";
  });

  message += `%0ADelivery Fee: ₦${DELIVERY_FEE}`;
  message += `%0A*Total: ₦${(subtotal + DELIVERY_FEE).toLocaleString()}*%0A`;

  if (ordernaInput.value.trim())
    message += `%0AName: ${encodeURIComponent(ordernaInput.value.trim())}`;
  if (orderloInput.value.trim())
    message += `%0ALocation: ${encodeURIComponent(orderloInput.value.trim())}`;
  if (notesInput.value.trim())
    message += `%0AInstructions: ${encodeURIComponent(
      notesInput.value.trim()
    )}`;

  message += "%0A%0AThank you!";
  window.open(`https://wa.me/2348035174263?text=${message}`, "_blank");
});

// Event Listeners
addFirstItemBtn.addEventListener("click", () => createOrderRow());
addMoreBtn.addEventListener("click", () => createOrderRow());
document.addEventListener("click", handleAddToCartClick);
orderItems.addEventListener("input", updateTotals);
