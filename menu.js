/* -------------------------------------------------
   Menu data  ➜  SINGLE SOURCE OF TRUTH
--------------------------------------------------*/
window.menuItems = [
  {
    id: 1,
    name: "Vegetable Soup / swallow",
    description: "A wholesome mix of fresh greens simmered to perfection.",
    price: 3200,
    image: "vegetable.png",
    featured: false,
  },
  {
    id: 2,
    name: "Egusi Soup / swallow",
    description: "Classic melon seed soup with bold, rich flavors.",
    price: 2200,
    image: "egusi.png",
    featured: true,
  },
  {
    id: 3,
    name: "Bitter-Leaf Soup / swallow",
    description: "A hearty, traditional favorite with a subtle bitter kick.",
    price: 2200,
    image: "bitterleaf.png",
    featured: false,
  },
  {
    id: 4,
    name: "Ogbono Soup / swallow",
    description: "Thick, drawy delight with deep native spice notes.",
    price: 2200,
    image: "ogbono.png",
    featured: false,
  },
  {
    id: 5,
    name: "Afang Soup / swallow",
    description: "Earthy, nutritious delight from the South-South kitchen.",
    price: 3200,
    image: "afang.png",
    featured: true,
  },
  {
    id: 6,
    name: "Uziza Soup / swallow",
    description: "Spicy and aromatic, packed with bold village flavor.",
    price: 2200,
    image: "uziza.png",
    featured: true,
  },
  {
    id: 7,
    name: "Oha Soup / swallow",
    description: "Soft oha leaves in a thick, savory soup base.",
    price: 2200,
    image: "oha.png",
    featured: false,
  },
  {
    id: 8,
    name: "Okra Soup / swallow",
    description: "Drawy and flavorful with a slippery-smooth finish.",
    price: 2200,
    image: "okra.png",
    featured: false,
  },
  {
    id: 9,
    name: "White Soup (Nsala) / swallow",
    description: "A rich, peppery delicacy without palm oil.",
    price: 3700,
    image: "nsala.png",
    featured: true,
  },
  {
    id: 10,
    name: "Rice / banga stew (ofe akwu)",
    description: "Palm nut richness poured over soft white rice.",
    price: 1700,
    image: "banga.png",
    featured: true,
  },
  {
    id: 11,
    name: "Rice / vegetable ",
    description: "Fluffy rice meets lush, savory vegetable sauce.",
    price: 1700,
    image: "riceveg.png",
    featured: false,
  },
  {
    id: 12,
    name: "Jollof rice & beef",
    description: "Smoky, spicy jollof rice with juicy beef cuts.",
    price: 2200,
    image: "jollof.png",
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

