/* -------------------------------------------------
   Config
--------------------------------------------------*/
const MAX_ITEMS = 10;

/* -------------------------------------------------
   Cached DOM nodes
--------------------------------------------------*/
const orderItems = document.getElementById("orderItems");
const orderForm = document.getElementById("orderForm");
const addFirstItemBtn = document.getElementById("addFirstItemBtn");
const addMoreBtn = document.getElementById("addMoreBtn");
const notesInput = document.getElementById("notes");

let itemCount = 0; // we always build rows dynamically

/* -------------------------------------------------
   Helpers
--------------------------------------------------*/
const toast = (msg) => {
  const div = document.createElement("div");
  div.className = "add-to-cart-confirmation";
  div.textContent = msg;
  document.body.appendChild(div);
  requestAnimationFrame(() => div.classList.add("show"));
  setTimeout(() => div.classList.remove("show"), 2300);
  div.addEventListener("transitionend", () => div.remove());
};

const scrollToOrder = () =>
  document.getElementById("order").scrollIntoView({ behavior: "smooth" });

const toggleAddButtons = () => {
  const hasRows = orderItems.children.length > 0;
  addFirstItemBtn.style.display = hasRows ? "none" : "inline-block";
  addMoreBtn.style.display = hasRows ? "inline-block" : "none";
};

/* -------------------------------------------------
   Build <option>s from *menuItems* (no duplicates!)
--------------------------------------------------*/
function buildOptions(selected = "") {
  return window.menuItems
    .map(
      ({ name, price }) => `
      <option value="${name}"
              data-price="${price}"
              ${name === selected ? "selected" : ""}>
        ${name} – ₦${price.toLocaleString()}
      </option>`
    )
    .join("");
}

/* -------------------------------------------------
   Add a new (empty or pre‑filled) order row
--------------------------------------------------*/
function addOrderRow(dishName = "", quantity = 1) {
  if (orderItems.children.length >= MAX_ITEMS) {
    return alert(`You can order up to ${MAX_ITEMS} different dishes.`);
  }

  const row = document.createElement("div");
  row.className = "order-item new-item";
  row.innerHTML = `
    <div class="form-group">
      <label>Menu Item
        <select class="form-control" required>
          <option value="" disabled ${
            dishName ? "" : "selected"
          }>Select a dish</option>
          ${buildOptions(dishName)}
        </select>
      </label>
    </div>
    <div class="form-group">
      <label>Quantity
        <input type="number" class="form-control" min="1" max="20"
               value="${quantity}" required>
      </label>
    </div>
    <button type="button" class="remove-item" aria-label="Remove item">
      <i class="fas fa-times"></i>
    </button>
  `;

  row.querySelector(".remove-item").onclick = () => {
    row.remove();
    toggleAddButtons();
  };

  orderItems.appendChild(row);
  setTimeout(() => row.classList.remove("new-item"), 600);

  toggleAddButtons();
}

/* -------------------------------------------------
   Increment qty or create new row from a menu card
--------------------------------------------------*/
function addDishToOrder(dishName) {
  const existing = [...orderItems.querySelectorAll("select")].find(
    (sel) => sel.value === dishName
  );

  if (existing) {
    const qtyInput = existing
      .closest(".order-item")
      .querySelector('input[type="number"]');
    qtyInput.value = +qtyInput.value + 1;
    existing.closest(".order-item").classList.add("updated");
    setTimeout(
      () => existing.closest(".order-item").classList.remove("updated"),
      600
    );
  } else {
    addOrderRow(dishName, 1);
  }

  scrollToOrder();
  toast(`${dishName} added!`);
}

/* -------------------------------------------------
   Event delegation (menu cards)
--------------------------------------------------*/
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  const card = btn.closest(".menu-card");
  const dishName = card.querySelector("h3").textContent.trim();
  addDishToOrder(dishName);
});

/* -------------------------------------------------
   Add‑item buttons
--------------------------------------------------*/
addFirstItemBtn.addEventListener("click", () => addOrderRow());
addMoreBtn.addEventListener("click", () => addOrderRow());

/* -------------------------------------------------
   Submit ➜ WhatsApp
--------------------------------------------------*/
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const selects = orderItems.querySelectorAll("select");
  const quantities = orderItems.querySelectorAll('input[type="number"]');

  if (selects.length === 0) return alert("Please add at least one dish.");

  for (let i = 0; i < selects.length; i++) {
    if (!selects[i].value) return alert("Select a dish for every line.");
    if (quantities[i].value < 1 || quantities[i].value > 20)
      return alert("Quantity must be 1‑20 for all dishes.");
  }

  let msg = "Hello Mummachis Kitchen! I would like to place an order:%0A%0A";
  let total = 0;

  selects.forEach((sel, i) => {
    const dish = sel.value;
    const qty = +quantities[i].value;
    const price = +sel.selectedOptions[0].dataset.price;
    const line = price * qty;

    total += line;
    msg += `- ${dish} × ${qty} = ₦${line.toLocaleString()}%0A`;
  });

  const notes = notesInput?.value.trim();
  if (notes) msg += `%0AInstructions: ${encodeURIComponent(notes)}%0A`;

  msg += `%0ATotal: ₦${total.toLocaleString()}%0A%0AThank you!`;

  window.open(`https://wa.me/2348035174263?text=${msg}`, "_blank");

  /* feedback */
  const btn = orderForm.querySelector(".submit-btn");
  const html = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
  btn.style.background = "#2ecc71";
  setTimeout(() => {
    btn.innerHTML = html;
    btn.style.background = "";
  }, 3000);
});

/* -------------------------------------------------
   Misc UX: mobile nav, sticky header, smooth scroll
--------------------------------------------------*/
(() => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector("header");

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    hamburger.querySelector("i").classList.toggle("fa-bars");
    hamburger.querySelector("i").classList.toggle("fa-times");
  });

  navLinks?.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
      hamburger.querySelector("i").classList.add("fa-bars");
      hamburger.querySelector("i").classList.remove("fa-times");
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.matches('a[href^="#"]:not([href="#"])')) {
      e.preventDefault();
      document
        .querySelector(e.target.getAttribute("href"))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  });

  window.addEventListener("scroll", () =>
    header.classList.toggle("scrolled", window.scrollY > 50)
  );

  /* first render */
  toggleAddButtons();
})();
