"use strict";

// === DOM Ready ===
document.addEventListener("DOMContentLoaded", function () {
  // Initialize components
  initDatePickers();
  generateTimeSlots();
  populateTakeawayMenu();
  bindTabSwitching();
  bindFormSubmissions();
  setupHamburgerMenu();
});

// === Initialize Date Pickers ===
function initDatePickers() {
  const commonOptions = {
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [(date) => date.getDay() === 0],
  };

  flatpickr("#event-date", commonOptions);
  flatpickr("#takeaway-date", commonOptions);
}

// === Generate Time Slots ===
function generateTimeSlots() {
  const container = document.getElementById("time-slots");
  if (!container) return;

  const staticSlots = [
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
  ];

  container.innerHTML = staticSlots
    .map((time) => `<div class="time-slot" data-time="${time}">${time}</div>`)
    .join("");

  container.querySelectorAll(".time-slot").forEach((slot) => {
    slot.addEventListener("click", function () {
      document
        .querySelectorAll(".time-slot")
        .forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");
      document.getElementById("takeaway-time").value = this.dataset.time;
    });
  });
}

// === Menu & Swallow Pairing ===
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

  return swallowMap[soupName] || ["Eba", "Fufu", "Pounded Yam", "semolina", "wheat"];
}

// === Populate Takeaway Menu ===
function populateTakeawayMenu() {
  const container = document.getElementById("takeaway-items-container");
  if (!container || !window.menuItems) return;

  const addItem = () => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "order-item new-item";

    const options = window.menuItems
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("");

    itemDiv.innerHTML = `
      <select class="form-control takeaway-item" onchange="updateSwallowSelect(this); updateSubtotal(this)" required>
        <option value="">Select soup or food</option>
        ${options}
      </select>
      <select class="form-control swallow-select" disabled>
        <option value="">Select swallow</option>
      </select>
      <input type="number" class="form-control takeaway-qty" placeholder="Qty" min="1" value="1" onchange="updateSubtotal(this)" required>
      <span class="item-subtotal">₦0</span>
      <button type="button" class="remove-item" onclick="removeTakeawayItem(this)">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(itemDiv);
  };

  if (container.childElementCount === 0) addItem();
  window.addTakeawayItem = addItem;
}

// === Update Swallow Options ===
function updateSwallowSelect(selectEl) {
  const item = window.menuItems.find((m) => m.id == selectEl.value);
  const container = selectEl.closest(".order-item");
  const swallowSelect = container.querySelector(".swallow-select");

  if (item && item.name.toLowerCase().includes("soup")) {
    const swallows = getSwallowOptionsForSoup(item.name);
    swallowSelect.innerHTML = swallows
      .map((swallow) => `<option value="${swallow}">${swallow}</option>`)
      .join("");
    swallowSelect.disabled = false;
  } else {
    swallowSelect.innerHTML = `<option value="">N/A</option>`;
    swallowSelect.disabled = true;
  }
}

// === Update Subtotal ===
function updateSubtotal(input) {
  const item = input.closest(".order-item");
  const select = item.querySelector(".takeaway-item");
  const qty = parseInt(item.querySelector(".takeaway-qty").value, 10) || 0;
  const subtotalEl = item.querySelector(".item-subtotal");

  const menuItem = window.menuItems.find((m) => m.id == select.value);
  const subtotal = menuItem ? menuItem.price * qty : 0;

  subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
  updateTakeawayTotal();
}

// === Update Total ===
function updateTakeawayTotal() {
  let total = 0;
  document.querySelectorAll(".order-item").forEach((item) => {
    const select = item.querySelector(".takeaway-item");
    const qty = parseInt(item.querySelector(".takeaway-qty").value, 10) || 0;
    const menuItem = window.menuItems.find((m) => m.id == select.value);
    if (menuItem) total += menuItem.price * qty;
  });

  total += 500; // Delivery fee
  const totalField = document.getElementById("total-price");
  if (totalField) {
    totalField.textContent = `Total (incl. ₦500 delivery): ₦${total.toLocaleString()}`;
  }
}

// === Remove Item ===
function removeTakeawayItem(button) {
  const item = button.closest(".order-item");
  if (item) {
    item.remove();
    updateTakeawayTotal();
  }
}

// === Tab Switching ===
function bindTabSwitching() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      const tab = document.getElementById(this.dataset.tab);
      if (tab) tab.classList.add("active");
    });
  });
}

// === Form Submission Bindings ===
function bindFormSubmissions() {
  document
    .getElementById("event-booking")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      sendEventToWhatsApp();
    });

  document
    .getElementById("takeaway-booking")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      sendTakeawayToWhatsApp();
    });
}

// === Send Event Booking to WhatsApp ===
function sendEventToWhatsApp() {
  const name = document.getElementById("event-name")?.value || "Not provided";
  const date = document.getElementById("event-date")?.value || "Not selected";
  const details = document.getElementById("event-notes")?.value || "No details";
  const times =
    document.getElementById("event-time")?.value || "Time not selected";
  const guests =
    document.getElementById("event-guests")?.value || "Not specified";

  const msg = `📅 *Event Booking*\n\n👤 Name: ${name}\n📆 Date: ${date}\n🕒 Time: ${times}\n👥 Guests: ${guests}\n📝 Details: ${details}`;
  const url = `https://wa.me/2348035174263?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// === Send Takeaway Order to WhatsApp ===
function sendTakeawayToWhatsApp() {
  const name = document.getElementById("takeaway-name").value.trim();
  const phone = document.getElementById("takeaway-phone").value.trim();
  const date = document.getElementById("takeaway-date").value.trim();
  const time = document.getElementById("takeaway-time").value.trim();
  const notes = document.getElementById("takeaway-notes").value.trim();

  if (!name || !phone || !date || !time) {
    alert("Please fill all required fields.");
    return;
  }

  const items = [];
  let total = 0;

  document.querySelectorAll(".order-item").forEach((item) => {
    const id = parseInt(item.querySelector(".takeaway-item").value, 10);
    const qty = parseInt(item.querySelector(".takeaway-qty").value, 10);
    const swallow = item.querySelector(".swallow-select").value;
    const menuItem = window.menuItems.find((m) => m.id === id);

    if (menuItem && qty > 0) {
      const price = menuItem.price * qty;
      total += price;

      const swallowText =
        menuItem.name.toLowerCase().includes("soup") && swallow
          ? ` with ${swallow}`
          : "";
      items.push(
        `${menuItem.name}${swallowText} x${qty} — ₦${price.toLocaleString()}`
      );
    }
  });

  if (items.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  total += 500; // Add delivery fee

  const message = `🛍️ *Takeaway Order from ${name}*
📱 Phone: ${phone}
📅 Pickup Date: ${date}
🕒 Pickup Time: ${time}
🧾 Order:
${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}
🚚 Delivery Fee: ₦500
💵 Total: ₦${total.toLocaleString()}
📝 Notes: ${notes || "None"}
`;

  const url = `https://wa.me/2348035174263?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// === Hamburger Menu ===
function setupHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.getElementById("navlinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");

      const icon = hamburger.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");

        const icon = hamburger.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-times");
        }
      }
    });
  }
}
