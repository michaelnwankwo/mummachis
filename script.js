const MAX_ITEMS = 10;
const DELIVERY_FEE = 500;

const orderItems = document.getElementById("orderItems");
const orderForm = document.getElementById("orderForm");
const addFirstItemBtn = document.getElementById("addFirstItemBtn");
const addMoreBtn = document.getElementById("addMoreBtn");
const notesInput = document.getElementById("notes");
const orderloInput = document.getElementById("orderlo");
const ordernaInput = document.getElementById("ordernam");
const subtotalElement = document.getElementById("subtotal");
const totalAmountElement = document.getElementById("totalAmount");

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

function createOrderRow(dishName = "", quantity = 1, swallow = "") {
  if (orderItems.children.length >= MAX_ITEMS) {
    return alert(`You can order up to ${MAX_ITEMS} different dishes.`);
  }

  const row = document.createElement("div");
  row.className = "order-item";
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
      <select class="form-control swallow-select">
        <option value="">No swallow</option>
        <option value="Pounded Yam" ${
          swallow === "Pounded Yam" ? "selected" : ""
        }>Pounded Yam</option>
        <option value="Fufu" ${
          swallow === "Fufu" ? "selected" : ""
        }>Fufu</option>
        <option value="Eba" ${swallow === "Eba" ? "selected" : ""}>Eba</option>
        <option value="Amala" ${
          swallow === "Amala" ? "selected" : ""
        }>Amala</option>
        <option value="Semolina" ${
          swallow === "Semolina" ? "selected" : ""
        }>Semolina</option>
        <option value="Wheat" ${
          swallow === "Wheat" ? "selected" : ""
        }>Wheat</option>
      </select>
    </div>
    <button type="button" class="remove-item">×</button>
  `;

  row.querySelector(".remove-item").addEventListener("click", () => {
    row.remove();
    updateTotals();
    toggleButtons();
  });

  orderItems.appendChild(row);
  updateTotals();
  toggleButtons();
}

function updateTotals() {
  const rows = orderItems.querySelectorAll(".order-item");
  let subtotal = 0;

  rows.forEach((row) => {
    const dish = row.querySelector(".dish-select").value;
    const qty = parseInt(row.querySelector(".qty-input").value);
    const menuItem = window.menuItems.find((item) => item.name === dish);
    if (menuItem && qty > 0) {
      subtotal += menuItem.price * qty;
    }
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

orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const rows = orderItems.querySelectorAll(".order-item");
  if (rows.length === 0) return alert("Add at least one item to your order.");

  let subtotal = 0;
  let message = "Hello Mummachis Kitchen! I would like to place an order:%0A";

  rows.forEach((row, i) => {
    const dish = row.querySelector(".dish-select").value;
    const qty = parseInt(row.querySelector(".qty-input").value);
    const swallow = row.querySelector(".swallow-select").value;
    const menuItem = window.menuItems.find((item) => item.name === dish);

    if (!dish || qty < 1 || !menuItem) return;

    const itemTotal = menuItem.price * qty;
    subtotal += itemTotal;

    message += `%0A${i + 1}. ${dish} x${qty} – ₦${itemTotal.toLocaleString()}`;
    if (swallow) message += ` with ${swallow}`;
  });

  message += `%0A%0ADelivery Fee: ₦${DELIVERY_FEE}`;
  const total = subtotal + DELIVERY_FEE;
  message += `%0A*Total: ₦${total.toLocaleString()}*`;

  const name = ordernaInput.value.trim();
  const location = orderloInput.value.trim();
  const notes = notesInput.value.trim();

  if (name) message += `%0AName: ${encodeURIComponent(name)}`;
  if (location) message += `%0ALocation: ${encodeURIComponent(location)}`;
  if (notes) message += `%0AInstructions: ${encodeURIComponent(notes)}`;

  message += `%0A%0AThank you!`;

  window.open(`https://wa.me/2348035174263?text=${message}`, "_blank");
});

addFirstItemBtn.addEventListener("click", () => createOrderRow());
addMoreBtn.addEventListener("click", () => createOrderRow());

orderItems.addEventListener("change", updateTotals);
orderItems.addEventListener("input", updateTotals);

// === Menu Card Add‑to‑Order functionality ===
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const dishName = card.querySelector("h3")?.textContent.trim();
  if (dishName) addDishToOrder(dishName);
});

function addDishToOrder(dishName) {
  const existing = [...orderItems.querySelectorAll(".order-item")].find(
    (row) => {
      const select = row.querySelector(".dish-select");
      return select?.value === dishName;
    }
  );

  if (existing) {
    const qtyInput = existing.querySelector("input.qty-input");
    qtyInput.value = +qtyInput.value + 1;
  } else {
    createOrderRow(dishName, 1);
  }

  updateTotals();
  toggleButtons();

  // ✅ Smooth scroll to order section with header offset
  const orderSection = document.getElementById("order");
  if (orderSection) {
    const headerOffset = 100;
    const elementPosition = orderSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  // ✅ Confirmation popup
  const div = document.createElement("div");
  div.className = "add-to-cart-confirmation";
  div.textContent = `${dishName} added to order`;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add("show"));
  setTimeout(() => div.classList.remove("show"), 2000);
  div.addEventListener("transitionend", () => div.remove());
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  createOrderRow();
  toggleButtons();
});
