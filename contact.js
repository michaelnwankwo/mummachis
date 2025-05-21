"use strict";

// === DOM Ready ===
document.addEventListener("DOMContentLoaded", function () {
  initDatePickers();
  generateTimeSlots();
  populateTakeawayMenu();
  bindTabSwitching();
  bindFormSubmissions();
});

// === Initialize Date Pickers ===
function initDatePickers() {
  flatpickr("#event-date", {
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [(date) => date.getDay() === 0],
  });

  flatpickr("#takeaway-date", {
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [(date) => date.getDay() === 0],
  });
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
    .map(
      (timeStr) => `
    <div class="time-slot" data-time="${timeStr}">${timeStr}</div>
  `
    )
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

// === Populate Menu Dropdown in Takeaway Form ===
function populateTakeawayMenu() {
  const container = document.getElementById("takeaway-items-container");
  if (!container || !window.menuItems) return;

  const addTakeawayItem = () => {
    const newItem = document.createElement("div");
    newItem.className = "order-item new-item";

    const options = window.menuItems
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("");

    newItem.innerHTML = `
      <select class="form-control takeaway-item" onchange="updateSubtotal(this)" required>
        <option value="">Select item</option>
        ${options}
      </select>
      <input type="number" class="form-control takeaway-qty" placeholder="Qty" min="1" value="1" onchange="updateSubtotal(this)" required>
      <span class="item-subtotal">₦0</span>
      <button type="button" class="remove-item" onclick="removeTakeawayItem(this)">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(newItem);
  };

  // Add first item by default (optional)
  if (container.childElementCount === 0) {
    addTakeawayItem();
  }

  // Make the function globally accessible
  window.addTakeawayItem = addTakeawayItem;
}

// === Update Subtotal for Item ===
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

// === Update Total for All Takeaway Items ===
function updateTakeawayTotal() {
  let total = 0;

  document.querySelectorAll(".order-item").forEach((item) => {
    const select = item.querySelector(".takeaway-item");
    const qty = parseInt(item.querySelector(".takeaway-qty").value, 10) || 0;
    const menuItem = window.menuItems.find((m) => m.id == select.value);
    if (menuItem) {
      total += menuItem.price * qty;
    }
  });

  const totalField = document.getElementById("total-price");
  if (totalField) {
    totalField.textContent = `Total: ₦${total.toLocaleString()}`;
  }
}

// === Remove Takeaway Item ===
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

// === Send Takeaway Order to WhatsApp ===
function sendTakeawayToWhatsApp() {
  const name = document.getElementById("takeaway-name").value.trim();
  const phone = document.getElementById("takeaway-phone").value.trim();
  const date = document.getElementById("takeaway-date").value.trim();
  const time = document.getElementById("takeaway-time").value.trim();
  const notes = document.getElementById("takeaway-notes").value.trim();

  if (!name || !phone || !date || !time) {
    alert("Please fill in all required fields including pickup time.");
    return;
  }

  const items = [];
  let total = 0;

  document.querySelectorAll(".order-item").forEach((item) => {
    const itemId = parseInt(item.querySelector(".takeaway-item").value, 10);
    const qty = parseInt(item.querySelector(".takeaway-qty").value, 10);
    const menuItem = window.menuItems.find((m) => m.id === itemId);
    if (menuItem && qty > 0) {
      const subtotal = menuItem.price * qty;
      total += subtotal;
      items.push(`${menuItem.name} x${qty} — ₦${subtotal.toLocaleString()}`);
    }
  });

  if (items.length === 0) {
    alert("Please add at least one item to the order.");
    return;
  }

  const message = `📦 *Takeaway Order from ${name}*
  📱 Phone: ${phone}
  📅 Pickup Date: ${date}
  🕒 Pickup Time: ${time}
  🧾 Items:
  ${items.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}
  💵 Total: ₦${total.toLocaleString()}
  📝 Notes: ${notes || "None"}`;

  const encoded = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/2348035174263?text=${encoded}`;
  window.open(whatsappURL, "_blank");
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
  const encodedMsg = encodeURIComponent(msg);
  const whatsappURL = `https://wa.me/2348035174263?text=${encodedMsg}`;
  window.open(whatsappURL, "_blank");
}

// === Confirmation Modal ===
function showConfirmation(title, message) {
  document.getElementById("confirmation-title").textContent = title;
  document.getElementById("confirmation-text").textContent = message;
  document.getElementById("overlay").classList.add("show");
  document.getElementById("confirmation-message").classList.add("show");
}

function closeConfirmation() {
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("confirmation-message").classList.remove("show");
}
