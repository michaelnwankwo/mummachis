/* -------------------------------------------------
   Menu data  ➜  SINGLE SOURCE OF TRUTH
--------------------------------------------------*/
window.menuItems = [
  {
    id: 1,
    name: "Jollof Rice",
    description: "A beloved West African dish with spiced tomato rice…",
    price: 2500,
    image: "jollof-rice.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "Egusi Soup / swallow",
    description: "Smooth pounded yam served with rich melon seed soup…",
    price: 3000,
    image: "egusi",
    featured: true,
  },
  /* … add the rest of your items … */
  {
    id: 16,
    name: "New Dish",
    description: "Description of new dish…",
    price: 3000,
    image: "new-dish.jpg",
    featured: true,
  },
];

/* -------------------------------------------------
     Helper – build one menu card
  --------------------------------------------------*/
function createMenuCard({ name, description, price, image }) {
  return `
      <article class="menu-card" tabindex="0" aria-label="${name}">
        <div class="menu-card-img">
          <img src="${image}" alt="${name}">
        </div>
        <div class="menu-card-content">
          <h3>${name}</h3>
          <p class="description">${description}</p>
          <div class="menu-card-price">
            <span class="price">₦${price.toLocaleString()}</span>
            <button class="add-to-cart" aria-label="Add ${name} to order">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </article>`;
}

/* -------------------------------------------------
     Inject cards into whichever containers exist
  --------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  /* Home page – featured section */
  const featuredContainer = document.getElementById("featured-menu");
  if (featuredContainer) {
    featuredContainer.innerHTML = menuItems
      .filter((m) => m.featured)
      .map(createMenuCard)
      .join("");
  }

  /* Full‑menu page */
  const fullContainer = document.getElementById("all-menu-items");
  if (fullContainer) {
    fullContainer.innerHTML = menuItems.map(createMenuCard).join("");
  }
});
