document.documentElement.classList.add("js");

/* ---------- Sound ---------- */
setupSound(document.getElementById("soundBtn"));

/* ---------- Menu data ---------- */
const MENU = [
  // Burgers
  { id: "ember-smash", cat: "burgers", name: "The Ember Smash", price: 890, icon: "burger",
    desc: "Double smashed patty, melted cheddar, pickles and our ember sauce.", badge: "Best seller", style: "" },
  { id: "double-stack", cat: "burgers", name: "Double Cheese Stack", price: 990, icon: "burger",
    desc: "Two flame-grilled patties, double cheese and crisp lettuce.", style: "--patty:#3d1d10;--cheese:#ff8a3d" },
  { id: "spicy-inferno", cat: "burgers", name: "Spicy Inferno", price: 850, icon: "burger",
    desc: "Peppery patty, jalapeños and hot sauce for those who like heat.", badge: "Hot",
    style: "--bun:#d98324;--cheese:#ff5a1f;--leaf:#7fbf3f" },

  // Chicken
  { id: "drumsticks", cat: "chicken", name: "Crispy Drumsticks (6 pcs)", price: 790, icon: "chicken",
    desc: "Golden and crunchy outside, juicy inside.", style: "" },
  { id: "zinger", cat: "chicken", name: "Zinger Burger", price: 750, icon: "burger",
    desc: "Crunchy chicken fillet, mayo and fresh lettuce in a soft bun.", badge: "Popular",
    style: "--patty:#d98324;--cheese:#ffe9b0" },
  { id: "hot-wings", cat: "chicken", name: "Hot Wings (8 pcs)", price: 690, icon: "chicken",
    desc: "Tossed in our spicy glaze and served with a cool dip.", style: "--crisp:#c4521a" },

  // Sides
  { id: "fries", cat: "sides", name: "Golden Fries", price: 290, icon: "fries",
    desc: "Thin, crispy and salted just right.", style: "" },
  { id: "rings", cat: "sides", name: "Onion Rings", price: 350, icon: "rings",
    desc: "Thick-cut rings in a light, crunchy coating.", style: "" },
  { id: "loaded-fries", cat: "sides", name: "Cheese Loaded Fries", price: 450, icon: "fries",
    desc: "Fries covered in cheese sauce and crispy toppings.", badge: "New", style: "--box:#2b2320" },

  // Drinks
  { id: "choc-shake", cat: "drinks", name: "Chocolate Shake", price: 450, icon: "shake",
    desc: "Thick, cold and topped with cream.", style: "" },
  { id: "straw-shake", cat: "drinks", name: "Strawberry Shake", price: 450, icon: "shake",
    desc: "Made with real strawberry flavour and whipped cream.", style: "--shake:#f48fb1" },
  { id: "cola", cat: "drinks", name: "Cold Cola", price: 190, icon: "cup",
    desc: "Ice-cold and fizzy.", style: "--drink:#3a1e12" },
  { id: "lemonade", cat: "drinks", name: "Mint Lemonade", price: 290, icon: "cup",
    desc: "Fresh lemon, mint and ice.", style: "--drink:#8bd450" }
];

const DEALS = {
  solo:   { id: "deal-solo",   name: "Solo Smash Combo", price: 1190, icon: "burger", style: "" },
  duo:    { id: "deal-duo",    name: "Duo Feast",        price: 2150, icon: "burger", style: "--cheese:#ff8a3d" },
  family: { id: "deal-family", name: "Family Box",       price: 3990, icon: "chicken", style: "" }
};

const money = (n) => "Rs. " + n.toLocaleString("en-US");

/* ---------- Render the menu ---------- */
const menuGrid = document.getElementById("menuGrid");

function renderMenu(cat) {
  const items = MENU.filter((item) => item.cat === cat);
  menuGrid.innerHTML = items
    .map(
      (item, i) => `
      <article class="menu-card" style="animation-delay:${i * 70}ms">
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ""}
        <div class="menu-art">
          <svg style="${item.style}" aria-hidden="true"><use href="#${item.icon}"/></svg>
        </div>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="menu-foot">
          <span class="price">${money(item.price)}</span>
          <button class="btn btn-fire btn-sm" data-add="${item.id}" data-sound="none"
                  aria-label="Add ${item.name} to your order">Add</button>
        </div>
      </article>`
    )
    .join("");
}

renderMenu("burgers");

/* Category tabs */
const tabs = document.querySelectorAll(".tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    renderMenu(tab.dataset.cat);
    Sound.pop();
  });
});

/* ---------- Cart ---------- */
const cart = new Map(); // id -> { item, qty }

const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function findItem(id) {
  const fromMenu = MENU.find((m) => m.id === id);
  if (fromMenu) return fromMenu;
  return Object.values(DEALS).find((d) => d.id === id);
}

function addToCart(item) {
  const line = cart.get(item.id);
  if (line) line.qty += 1;
  else cart.set(item.id, { item, qty: 1 });
  renderCart();
  Sound.add();
  showToast(item.name + " added to your order");
  cartCount.classList.remove("bump");
  void cartCount.offsetWidth; // restarts the animation
  cartCount.classList.add("bump");
}

function changeQty(id, delta) {
  const line = cart.get(id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart.delete(id);
    Sound.remove();
  } else {
    Sound.pop();
  }
  renderCart();
}

function renderCart() {
  let count = 0;
  let total = 0;

  cartList.innerHTML = [...cart.values()]
    .map(({ item, qty }) => {
      count += qty;
      total += item.price * qty;
      return `
        <li class="cart-item">
          <div class="thumb"><svg style="${item.style}" aria-hidden="true"><use href="#${item.icon}"/></svg></div>
          <div>
            <h3>${item.name}</h3>
            <small>${money(item.price)}</small>
            <div class="qty">
              <button data-qty="-1" data-id="${item.id}" data-sound="none" aria-label="Remove one ${item.name}">-</button>
              <span>${qty}</span>
              <button data-qty="1" data-id="${item.id}" data-sound="none" aria-label="Add one more ${item.name}">+</button>
            </div>
          </div>
          <strong>${money(item.price * qty)}</strong>
        </li>`;
    })
    .join("");

  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  cartEmpty.hidden = cart.size > 0;
}

/* One listener handles every Add / deal / quantity button */
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    addToCart(findItem(addBtn.dataset.add));
    return;
  }

  const dealBtn = e.target.closest("[data-deal]");
  if (dealBtn) {
    addToCart(DEALS[dealBtn.dataset.deal]);
    return;
  }

  const qtyBtn = e.target.closest("[data-qty]");
  if (qtyBtn) {
    changeQty(qtyBtn.dataset.id, Number(qtyBtn.dataset.qty));
  }
});

/* ---------- Order drawer ---------- */
function openCart() {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("show"));
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  Sound.open();
}

function closeCart() {
  overlay.classList.remove("show");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  setTimeout(() => { overlay.hidden = true; }, 300);
  Sound.close();
}

cartBtn.addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
});

document.getElementById("clearCart").addEventListener("click", () => {
  if (cart.size === 0) return;
  cart.clear();
  renderCart();
  Sound.remove();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.size === 0) {
    Sound.error();
    showToast("Your order is empty. Add something first.");
    return;
  }
  cart.clear();
  renderCart();
  closeCart();
  setTimeout(() => {
    Sound.success();
    showToast("Thanks! This is a demo, so no real order was placed.");
  }, 350);
});

renderCart();

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

/* ---------- Button ripple ---------- */
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/* ---------- Hero burger: sizzle when you hover or tap it ---------- */
const heroArt = document.querySelector(".hero-art");
const heroBurger = document.getElementById("heroBurger");
heroArt.style.pointerEvents = "auto";
heroArt.addEventListener("mouseenter", () => {
  heroBurger.classList.add("pressed");
  Sound.sizzle();
});
heroArt.addEventListener("mouseleave", () => heroBurger.classList.remove("pressed"));
heroArt.addEventListener("click", () => Sound.sizzle());
