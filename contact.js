"use strict";

// ======================
// CONSTANTS & CONFIG
// ======================
const CONFIG = {
  maxItems: 10,
  deliveryFee: 500,
  timeSlots: [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
  ],
  portionMultipliers: {
    small: 0.8,
    regular: 1,
    large: 2.5,
    family: 6,
  },
  customizationPrices: {
    "extra-protein": 1000,
    "more-vegetables": 500,
    "different-swallow": 800,
    "extra-sauce": 500,
  },
};

// ======================
// DOM ELEMENTS
// ======================
const DOM = {
  containers: {
    takeawayItems: document.getElementById("takeaway-items-container"),
    timeSlots: document.getElementById("time-slots"),
    demandTimeSlots: document.getElementById("time-slots-demand"),
  },
  forms: {
    event: document.getElementById("event-booking"),
    takeaway: document.getElementById("takeaway-booking"),
    onDemand: document.getElementById("on-demand-form"),
  },
  buttons: {
    addItem: window.addTakeawayItem,
  },
};

// ======================
// INITIALIZATION
// ======================
document.addEventListener("DOMContentLoaded", function () {
  initializeDatePickers();
  initializeTimeSlots();
  initializeMenuSystems();
  setupEventHandlers();
});

function initializeDatePickers() {
  const options = {
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [(date) => date.getDay() === 0],
  };

  flatpickr("#event-date", options);
  flatpickr("#takeaway-date", options);
  flatpickr("#on-demand-date", options);
}

function initializeTimeSlots() {
  generateTimeSlots("time-slots", "takeaway-time");
  generateTimeSlots("time-slots-demand", "on-demand-time");
}

function initializeMenuSystems() {
  if (window.menuItems) {
    populateTakeawayMenu();
    setupOnDemandMenu();
  }
}

function setupEventHandlers() {
  setupTabSwitching();
  setupFormSubmissions();
  setupHamburgerMenu();
}

// ======================
// MENU SYSTEM FUNCTIONS
// ======================
function populateTakeawayMenu() {
  if (!DOM.containers.takeawayItems) return;

  const addMenuItem = () => {
    if (DOM.containers.takeawayItems.children.length >= CONFIG.maxItems) {
      alert(`Maximum ${CONFIG.maxItems} items allowed per order`);
      return;
    }

    const itemHTML = `
      <div class="order-item">
        <select class="form-control dish-select" required>
          <option value="">Select dish</option>
          ${window.menuItems
            .map(
              (item) => `
            <option value="${item.id}" data-price="${item.price}">
              ${item.name} - ₦${item.price.toLocaleString()}
            </option>
          `
            )
            .join("")}
        </select>
        <select class="form-control swallow-select" disabled>
          <option value="">Select swallow</option>
        </select>
        <input type="number" class="form-control qty-input" min="1" value="1" required>
        <span class="item-subtotal">₦0</span>
        <button type="button" class="remove-item">×</button>
      </div>
    `;

    const itemElement = document.createElement("div");
    itemElement.innerHTML = itemHTML;
    DOM.containers.takeawayItems.appendChild(itemElement);

    // Set up event listeners for the new item
    const dishSelect = itemElement.querySelector(".dish-select");
    const qtyInput = itemElement.querySelector(".qty-input");
    const removeBtn = itemElement.querySelector(".remove-item");

    dishSelect.addEventListener("change", function () {
      updateSwallowOptions(this);
      updateOrderTotals();
    });

    qtyInput.addEventListener("input", updateOrderTotals);
    removeBtn.addEventListener("click", removeOrderItem);
  };

  // Add first item by default
  if (DOM.containers.takeawayItems.children.length === 0) {
    addMenuItem();
  }

  // Make add function globally available
  window.addTakeawayItem = addMenuItem;
}

function setupOnDemandMenu() {
  const container = document.getElementById("base-dish-container");
  if (!container) return;

  // Create select element
  const selectHTML = `
    <select id="base-dish" class="form-control" required>
      <option value="" disabled selected>Select a base dish</option>
      ${window.menuItems
        .map(
          (item) => `
        <option value="${item.id}" data-price="${item.price}">
          ${item.name} - ₦${item.price.toLocaleString()}
        </option>
      `
        )
        .join("")}
    </select>
  `;

  // Insert the select element into the container
  container.insertAdjacentHTML("beforeend", selectHTML);

  // Set up event listeners
  document
    .getElementById("base-dish")
    .addEventListener("change", updateOnDemandPrice);
  document
    .getElementById("portion-size")
    .addEventListener("change", updateOnDemandPrice);
  DOM.forms.onDemand
    .querySelectorAll('input[name="custom"]')
    .forEach((input) => {
      input.addEventListener("change", updateOnDemandPrice);
    });
}

// ======================
// ORDER MANAGEMENT
// ======================
function updateSwallowOptions(selectElement) {
  const container = selectElement.closest(".order-item");
  const swallowSelect = container.querySelector(".swallow-select");
  const selectedItem = window.menuItems.find(
    (item) => item.id == selectElement.value
  );

  if (selectedItem?.name.toLowerCase().includes("soup")) {
    const options = getSwallowOptions(selectedItem.name);
    swallowSelect.innerHTML = `
      <option value="">Select swallow</option>
      ${options
        .map((option) => `<option value="${option}">${option}</option>`)
        .join("")}
    `;
    swallowSelect.disabled = false;
  } else {
    swallowSelect.innerHTML = '<option value="">N/A</option>';
    swallowSelect.disabled = true;
  }
}

function getSwallowOptions(dishName) {
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
    swallowMap[dishName] || ["Pounded Yam", "Fufu", "Eba", "Semolina", "Wheat"]
  );
}

function updateOrderTotals() {
  let subtotal = 0;

  document.querySelectorAll(".order-item").forEach((item) => {
    const dishId = item.querySelector(".dish-select").value;
    const quantity = parseInt(item.querySelector(".qty-input").value) || 0;
    const dish = window.menuItems.find((item) => item.id == dishId);

    if (dish) {
      const itemTotal = dish.price * quantity;
      subtotal += itemTotal;
      item.querySelector(
        ".item-subtotal"
      ).textContent = `₦${itemTotal.toLocaleString()}`;
    }
  });

  const total = subtotal + CONFIG.deliveryFee;
  document.getElementById(
    "total-price"
  ).textContent = `Total (incl. ₦${CONFIG.deliveryFee.toLocaleString()} delivery): ₦${total.toLocaleString()}`;
}

function removeOrderItem() {
  this.closest(".order-item")?.remove();
  updateOrderTotals();
}

function updateOnDemandPrice() {
  const baseDish = document.getElementById("base-dish");
  const basePrice = parseFloat(baseDish.selectedOptions[0]?.dataset.price) || 0;
  const portionSize = document.getElementById("portion-size").value;
  const customOptions = Array.from(
    document.querySelectorAll('input[name="custom"]:checked')
  ).map((checkbox) => checkbox.value);

  let price = basePrice * (CONFIG.portionMultipliers[portionSize] || 1);
  price += customOptions.reduce(
    (sum, option) => sum + (CONFIG.customizationPrices[option] || 0),
    0
  );

  document.getElementById(
    "custom-price"
  ).textContent = `Estimated Price: ₦${price.toLocaleString()}`;
}

// ======================
// FORM HANDLING
// ======================
// ======================
// TAB SWITCHING SYSTEM
// ======================
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Initialize first tab as active if none are active
  if (!document.querySelector(".tab-btn.active")) {
    tabButtons[0]?.classList.add("active");
    tabContents[0]?.classList.add("active");
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons and tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding tab
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId)?.classList.add("active");

      // Special initialization for time slots in on-demand
      if (tabId === "on-demand") {
        const timeSlotsContainer = document.getElementById("time-slots-demand");
        if (timeSlotsContainer && timeSlotsContainer.children.length === 0) {
          generateTimeSlots("time-slots-demand", "on-demand-time");
        }
      }
    });
  });
}

// Call this in your DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
  setupTabSwitching();
  // ... other initializations
});

function setupFormSubmissions() {
  // Event booking form
  DOM.forms.event?.addEventListener("submit", function (e) {
    e.preventDefault();
    submitEventBooking();
  });

  // Takeaway order form
  DOM.forms.takeaway?.addEventListener("submit", function (e) {
    e.preventDefault();
    submitTakeawayOrder();
  });

  // On-demand cooking form
  DOM.forms.onDemand?.addEventListener("submit", function (e) {
    e.preventDefault();
    submitOnDemandRequest();
  });
}

function submitEventBooking() {
  const formData = {
    name: document.getElementById("event-name").value.trim(),
    email: document.getElementById("event-email").value.trim(),
    phone: document.getElementById("event-phone").value.trim(),
    guests: document.getElementById("event-guests").value.trim(),
    date: document.getElementById("event-date").value.trim(),
    time: document.getElementById("event-time").value.trim(),
    details: document.getElementById("event-notes").value.trim(),
  };

  if (!validateRequiredFields(formData)) {
    alert("Please fill all required fields");
    return;
  }

  const message = `📅 *Event Booking Request*\n\n
👤 Name: ${formData.name}
📧 Email: ${formData.email}
📞 Phone: ${formData.phone}
👥 Guests: ${formData.guests}
📆 Date: ${formData.date}
🕒 Time: ${formData.time}
📝 Details: ${formData.details || "None"}`;

  sendWhatsAppMessage(message);
}

function submitTakeawayOrder() {
  const formData = {
    name: document.getElementById("takeaway-name").value.trim(),
    phone: document.getElementById("takeaway-phone").value.trim(),
    date: document.getElementById("takeaway-date").value.trim(),
    time: document.getElementById("takeaway-time").value.trim(),
    notes: document.getElementById("takeaway-notes").value.trim(),
    items: [],
  };

  // Collect order items
  document.querySelectorAll(".order-item").forEach((item, index) => {
    const dishId = item.querySelector(".dish-select").value;
    const quantity = item.querySelector(".qty-input").value;
    const swallow = item.querySelector(".swallow-select").value;
    const dish = window.menuItems.find((item) => item.id == dishId);

    if (dish && quantity > 0) {
      formData.items.push({
        name: dish.name,
        quantity: quantity,
        swallow: swallow,
        price: dish.price * quantity,
      });
    }
  });

  if (!validateRequiredFields(formData) || formData.items.length === 0) {
    alert("Please fill all required fields and add at least one item");
    return;
  }

  const itemsText = formData.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity}${
          item.swallow ? ` with ${item.swallow}` : ""
        } - ₦${item.price.toLocaleString()}`
    )
    .join("\n");

  const message = `🛍️ *Takeaway Order*\n\n
📞 Phone: ${formData.phone}
📅 Pickup Date: ${formData.date}
🕒 Pickup Time: ${formData.time}

🧾 Order Items:
${itemsText}

🚚 Delivery Fee: ₦${CONFIG.deliveryFee.toLocaleString()}
💵 Total: ₦${
    formData.items.reduce((sum, item) => sum + item.price, 0) +
    CONFIG.deliveryFee
  }

📝 Notes: ${formData.notes || "None"}`;

  sendWhatsAppMessage(message);
}

function submitOnDemandRequest() {
  const formData = {
    name: document.getElementById("on-demand-name").value.trim(),
    phone: document.getElementById("on-demand-phone").value.trim(),
    date: document.getElementById("on-demand-date").value.trim(),
    time: document.getElementById("on-demand-time").value.trim(),
    baseDish: document.getElementById("base-dish").value,
    portionSize: document.getElementById("portion-size").value,
    customizations: Array.from(
      document.querySelectorAll('input[name="custom"]:checked')
    ).map((checkbox) => checkbox.value),
    notes: document.getElementById("on-demand-notes").value.trim(),
    estimatedPrice: document.getElementById("custom-price").textContent,
  };

  // if (!validateRequiredFields(formData)) {
  //   alert("Please fill all required fields");
  //   return;
  // }

  const baseDish = window.menuItems.find(
    (item) => item.id == formData.baseDish
  );
  const customizationsText =
    formData.customizations.length > 0
      ? `✏️ Customizations: ${formData.customizations.join(", ")}\n`
      : "";

  const message = `🍳 *Custom Meal Request*\n\n
📞 Phone: ${formData.phone}
📅 Preferred Date: ${formData.date}
🕒 Preferred Time: ${formData.time}

🍽️ Base Dish: ${baseDish.name} (₦${baseDish.price.toLocaleString()})
📏 Portion Size: ${formData.portionSize.toUpperCase()}
${customizationsText}
📝 Special Requests: ${formData.notes || "None"}

${formData.estimatedPrice}`;

  sendWhatsAppMessage(message);
}

// ======================
// UTILITY FUNCTIONS
// ======================
function generateTimeSlots(containerId, timeInputId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = CONFIG.timeSlots
    .map(
      (time) => `
    <div class="time-slot" data-time="${time}">${time}</div>
  `
    )
    .join("");

  container.querySelectorAll(".time-slot").forEach((slot) => {
    slot.addEventListener("click", function () {
      container
        .querySelectorAll(".time-slot")
        .forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");
      document.getElementById(timeInputId).value = this.dataset.time;
    });
  });
}

function validateRequiredFields(fields) {
  return Object.values(fields).every(
    (value) =>
      value !== undefined && value !== null && value.toString().trim() !== ""
  );
}

function sendWhatsAppMessage(text) {
  const url = `https://wa.me/2348035174263?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
