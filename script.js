"use strict";

// Constants
const MAX_ITEMS = 10;
const DELIVERY_FEE = 500;
const NON_SWALLOW_DISHES = [
  "rice",
  "jollof",
  "fried rice",
  "ofada",
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
      ({ id, name, price }) => `
      <option value="${id}" data-price="${price}" ${
        name === selected ? "selected" : ""
      }>
        ${name} – ₦${price.toLocaleString()}
      </option>`
    )
    .join("");
}

function getSwallowOptions(soupName) {
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

function isRiceDish(dishName) {
  const riceKeywords = ["rice", "jollof", "fried rice", "ofada"];
  return riceKeywords.some((keyword) =>
    dishName.toLowerCase().includes(keyword)
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

  // Find the menu item by name to get its ID
  const menuItem = window.menuItems.find((item) => item.name === dishName);
  const itemId = menuItem ? menuItem.id : "";

  const row = document.createElement("div");
  row.className = "order-item";
  const showSwallow = isSoupDish(dishName);

  row.innerHTML = `
    <div class="form-group">
      <label>Select Main Dish</label>
      <select class="form-control dish-select" required>
        <option value="" disabled ${
          !dishName ? "selected" : ""
        }>Select a dish</option>
        ${buildMenuOptions(dishName)}
      </select>
    </div>
    <div class="form-group">
      <label>Main Dish Quantity</label>
      <input type="number" class="form-control qty-input" min="1" value="${quantity}" required />
    </div>
    <div class="swallow-group" style="display: ${
      showSwallow ? "block" : "none"
    }">
      <div class="form-group">
        <label>Select Swallow</label>
        <select class="form-control swallow-select" ${
          showSwallow ? "" : "disabled"
        }>
          <option value="">No swallow</option>
          ${
            showSwallow && menuItem
              ? getSwallowOptions(menuItem.name)
                  .map(
                    (swallow) =>
                      `<option value="${swallow}">${swallow}</option>`
                  )
                  .join("")
              : ""
          }
        </select>
      </div>
     <div class="form-group">
    ${
      showSwallow && menuItem
        ? getSwallowOptions(menuItem.name)
            .map(
              (swallow) =>
                `<option value="${swallow}">${swallow} (1st portion included)</option>`
            )
            .join("")
        : ""
    }
  </select>
</div>

<div class="form-group">
  <label>Swallow Portions</label>
  <input type="number" class="form-control swallow-qty" min="0" value="0" ${
    showSwallow ? "" : "disabled"
  } />
  <small class="swallow-help">First portion comes with your soup. Only pay for extras.</small>
</div>
    </div>
    <span class="item-subtotal">₦0</span>
    <button type="button" class="remove-item">×</button>
  `;

  row.querySelector(".remove-item").addEventListener("click", () => {
    row.remove();
    updateTotals();
    toggleButtons();
  });

  row.querySelector(".dish-select").addEventListener("change", (e) => {
    updateSwallowOptions(e.target);
    updateTotals();
  });

  // Initialize swallow select state for pre-selected dishes
  if (dishName && menuItem) {
    updateSwallowOptions(row.querySelector(".dish-select"));
  }

  orderItems.appendChild(row);
  updateTotals();
  toggleButtons();
}

function updateSwallowOptions(selectElement) {
  const container = selectElement.closest(".order-item");
  const swallowGroup = container.querySelector(".swallow-group");
  const swallowSelect = container.querySelector(".swallow-select");
  const swallowQty = container.querySelector(".swallow-qty");
  const selectedItem = window.menuItems.find(
    (item) => item.id == selectElement.value
  );

  // Check if it's a soup (not rice)
  const isSoup =
    selectedItem &&
    isSoupDish(selectedItem.name) &&
    !isRiceDish(selectedItem.name);

  if (isSoup) {
    // Show swallow fields for soups
    swallowGroup.style.display = "block";
    swallowSelect.disabled = false;
    swallowQty.disabled = false;
    const options = getSwallowOptions(selectedItem.name);
    swallowSelect.innerHTML = `
      <option value="">No swallow</option>
      ${options
        .map((option) => `<option value="${option}">${option}</option>`)
        .join("")}
    `;
  } else {
    // Hide and reset swallow fields for rice/non-soups
    swallowGroup.style.display = "none";
    swallowSelect.disabled = true;
    swallowSelect.value = "";
    swallowQty.disabled = true;
    swallowQty.value = 0;
  }
  updateTotals();
}

// Calculation Functions
function updateTotals() {
  const rows = orderItems.querySelectorAll(".order-item");
  let subtotal = 0;

  rows.forEach((row) => {
    const dishSelect = row.querySelector(".dish-select");
    const dishId = dishSelect.value;
    const qty = parseInt(row.querySelector(".qty-input").value) || 0;
    const menuItem = window.menuItems.find((item) => item.id == dishId);

    if (menuItem) {
      // Main dish price (includes first swallow if selected)
      const itemTotal = menuItem.price * qty;
      subtotal += itemTotal;

      // Check for swallow selection and quantities
      const swallowSelect = row.querySelector(".swallow-select");
      const swallowQty =
        parseInt(row.querySelector(".swallow-qty")?.value) || 0;

      if (swallowSelect?.value && swallowQty > 0) {
        // Calculate extra portions (total - 1 free portion)
        const extraPortions = Math.max(0, swallowQty - 1);
        const extraPortionPrice = 500; // Price per extra portion
        const extraTotal = extraPortions * extraPortionPrice;
        subtotal += extraTotal;

        // Update display
        if (extraPortions > 0) {
          row.querySelector(
            ".item-subtotal"
          ).textContent = `₦${itemTotal.toLocaleString()} + ${extraPortions} extra @₦${extraPortionPrice.toLocaleString()}`;
        } else {
          row.querySelector(
            ".item-subtotal"
          ).textContent = `₦${itemTotal.toLocaleString()} (1 portion included)`;
        }
      } else {
        row.querySelector(
          ".item-subtotal"
        ).textContent = `₦${itemTotal.toLocaleString()}`;
      }
    }
  });

  // Update UI totals
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
      const select = row.querySelector(".dish-select");
      const menuItem = window.menuItems.find((item) => item.id == select.value);
      return menuItem && menuItem.name === dishName;
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
  const SWALLOW_EXTRA_PRICE = 500; // Price for each extra swallow portion

  orderItems.querySelectorAll(".order-item").forEach((row, i) => {
    const dishId = row.querySelector(".dish-select").value;
    const qty = parseInt(row.querySelector(".qty-input").value) || 0;
    const swallow = row.querySelector(".swallow-select").value;
    const swallowQty = parseInt(row.querySelector(".swallow-qty").value) || 0;
    const menuItem = window.menuItems.find((item) => item.id == dishId);

    if (!dishId || qty < 1 || !menuItem) return;

    // Calculate main dish total
    const itemTotal = menuItem.price * qty;
    subtotal += itemTotal;

    // Start building the item line
    message += `${i + 1}. ${
      menuItem.name
    } x${qty} – ₦${itemTotal.toLocaleString()}`;

    // Handle swallow information if selected
    if (swallow && swallowQty > 0) {
      message += ` with ${swallow} (1 included`;

      // Calculate and add extra portions if any
      const extraPortions = Math.max(0, swallowQty - 1);
      if (extraPortions > 0) {
        const extraTotal = SWALLOW_EXTRA_PRICE * extraPortions;
        subtotal += extraTotal;
        message += ` + ${extraPortions} extra @₦${SWALLOW_EXTRA_PRICE}`;
      }
      message += `)`;
    }

    message += "%0A"; // New line for next item
  });

  // Add delivery fee and total
  message += `%0ADelivery Fee: ₦${DELIVERY_FEE}`;
  message += `%0A*Total: ₦${(subtotal + DELIVERY_FEE).toLocaleString()}*%0A%0A`;

  // Add customer information
  if (ordernaInput.value.trim()) {
    message += `Name: ${encodeURIComponent(ordernaInput.value.trim())}%0A`;
  }
  if (orderloInput.value.trim()) {
    message += `Location: ${encodeURIComponent(orderloInput.value.trim())}%0A`;
  }
  if (notesInput.value.trim()) {
    message += `Instructions: ${encodeURIComponent(
      notesInput.value.trim()
    )}%0A`;
  }

  message += "Thank you!";
  window.open(`https://wa.me/2348035174263?text=${message}`, "_blank");
});

// Event Listeners
addFirstItemBtn.addEventListener("click", () => createOrderRow());
addMoreBtn.addEventListener("click", () => createOrderRow());
document.addEventListener("click", handleAddToCartClick);
orderItems.addEventListener("input", updateTotals);
