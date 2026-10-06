/* =========================================================
   NOMAD — Thermos hero landing page
   Vanilla JS carousel: 6 products cycle right-to-left.
   Each product keeps ONE permanent DOM card; we only move
   cards between slot positions, so images never "swap" —
   they slide into place. Only the name/price text and the
   background gradient cross-fade.
   ========================================================= */

// ---- 1. PRODUCT DATA ----------------------------------------------------
// Edit / add products here. `image` paths are placeholders —
// drop your own transparent PNGs into /images with the same names.
const PRODUCTS = [
  {
    name: "Matte Black",
    etch: "Classic 500ml",
    capacity: "500ml",
    price: "$38",
    image: "images/thermos-1.png",
    bg1: "#3a3a3d",
    bg2: "#0b0b0c",
    accent: "#4a4a4d",
  },
  {
    name: "Forest Green",
    etch: "Trail 500ml",
    capacity: "500ml",
    price: "$42",
    image: "images/thermos-2.png",
    bg1: "#2f5142",
    bg2: "#0c1712",
    accent: "#3f6b52",
  },
  {
    name: "Ocean Blue",
    etch: "Voyage 600ml",
    capacity: "600ml",
    price: "$44",
    image: "images/thermos-3.png",
    bg1: "#233f5e",
    bg2: "#0a121c",
    accent: "#33517a",
  },
  {
    name: "Sand Beige",
    etch: "Desert 500ml",
    capacity: "500ml",
    price: "$40",
    image: "images/thermos-4.png",
    bg1: "#6b5847",
    bg2: "#1a140f",
    accent: "#8a7358",
  },
  {
    name: "Burgundy Red",
    etch: "Reserve 500ml",
    capacity: "500ml",
    price: "$46",
    image: "images/thermos-5.png",
    bg1: "#5a2430",
    bg2: "#160a0d",
    accent: "#7a3040",
  },
  {
    name: "Silver Steel",
    etch: "Metro 600ml",
    capacity: "600ml",
    price: "$45",
    image: "images/thermos-6.png",
    bg1: "#54585f",
    bg2: "#131417",
    accent: "#7a7f88",
  },
];

const TOTAL = PRODUCTS.length;
const AUTOPLAY_MS = 4000;
const TRANSITION_MS = 800;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ---- 2. DOM REFS ----------------------------------------------------------

const carousel = document.getElementById("carousel");
const frame = document.getElementById("frame");
const priceCard = document.getElementById("priceCard");
const priceName = document.getElementById("priceName");
const priceValue = document.getElementById("priceValue");
const dotsWrap = document.getElementById("dots");
const arrowLeft = document.getElementById("arrowLeft");
const arrowRight = document.getElementById("arrowRight");

// Two stacked background layers for a smooth gradient cross-fade
// (CSS can't reliably interpolate custom properties inside a
// gradient function, so we crossfade two flat layers instead).
const bgA = document.createElement("div");
const bgB = document.createElement("div");
[bgA, bgB].forEach((el, i) => {
  el.className = "bg-layer";
  el.style.position = "absolute";
  el.style.inset = "0";
  el.style.zIndex = "0";
  el.style.transition = `opacity ${TRANSITION_MS}ms ease`;
  el.style.opacity = i === 0 ? "1" : "0";
  frame.prepend(el);
});
let frontLayer = bgA;
let backLayer = bgB;

function bgGradient(p) {
  return `radial-gradient(120% 100% at 50% 0%, ${p.bg1} 0%, ${p.bg2} 70%)`;
}

// ---- 3. BUILD CARDS --------------------------------------------------------

const cards = PRODUCTS.map((product, index) => {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.index = index;

  card.innerHTML = `
    <div class="card-float">
      <div class="bottle">
        <img src="${product.image}" alt="${product.name} thermos" draggable="false" />
        <span class="card-etch">${product.etch}</span>
      </div>
      <div class="card-base"></div>
    </div>
  `;
  // Stone base tinted to match the product color
  card.querySelector(".card-base").style.background =
    `radial-gradient(120% 140% at 50% 20%, ${product.accent} 0%, ${product.bg2} 90%)`;

  card.addEventListener("click", () => {
    if (index !== active) goTo(index);
  });

  carousel.appendChild(card);
  return card;
});

// ---- 4. SLOT GEOMETRY -------------------------------------------------------
// delta = card position relative to the active card.
// With 6 items, normalized delta range is -3..2 (one item always hidden).
// Positions and scales are CSS variables (see :root in style.css) so
// each breakpoint can move the slots without touching JS.

const SLOT_STYLE = {
  "-3": { left: "var(--pos-out-l)", rotate: -28, scale: "var(--far-scale)", opacity: 0, z: 1 }, // hidden, off left edge
  "-2": { left: "var(--pos-l2)", rotate: -22, scale: "var(--far-scale)", opacity: 1, z: 2 },
  "-1": { left: "var(--pos-l1)", rotate: -15, scale: "var(--side-scale)", opacity: 1, z: 3 },
  "0": { left: "50%", rotate: 0, scale: "var(--hero-scale)", opacity: 1, z: 5 },
  "1": { left: "var(--pos-r1)", rotate: 15, scale: "var(--side-scale)", opacity: 1, z: 3 },
  "2": { left: "var(--pos-r2)", rotate: 22, scale: "var(--far-scale)", opacity: 1, z: 2 },
  "3": { left: "var(--pos-out-r)", rotate: 28, scale: "var(--far-scale)", opacity: 0, z: 1 }, // hidden, off right edge
};

function normalizedDelta(index, activeIndex) {
  let d = index - activeIndex;
  d = ((d % TOTAL) + TOTAL) % TOTAL; // 0..5
  if (d > 2) d -= TOTAL; // -> -3..2
  return d;
}

function applySlot(card, delta, withTransition = true) {
  const s = SLOT_STYLE[String(delta)];
  card.style.transition = withTransition && !prefersReducedMotion
    ? `left ${TRANSITION_MS}ms var(--ease), transform ${TRANSITION_MS}ms var(--ease), opacity ${TRANSITION_MS}ms var(--ease)`
    : "none";
  card.style.left = s.left;
  card.style.top = "50%";
  card.style.transform = `translate(-50%, -50%) rotate(${s.rotate}deg) scale(${s.scale})`;
  card.style.opacity = s.opacity;
  card.style.zIndex = s.z;
  card.classList.toggle("is-hero", delta === 0);
  card.style.pointerEvents = delta === 0 ? "none" : "auto";
}

// ---- 5. STATE + RENDER -------------------------------------------------------

let active = 0;
let autoplayTimer = null;
let animating = false;

// direction tells the hidden card which edge to leave through:
// moving right-to-left (1) it exits left, moving left-to-right (-1) it exits right.
function render(withTransition = true, direction = 1) {
  cards.forEach((card, index) => {
    let delta = normalizedDelta(index, active);
    if (delta === -3 && direction === -1) delta = 3;
    applySlot(card, delta, withTransition);
  });
  renderDots();
}

function renderDots() {
  dotsWrap.innerHTML = "";
  PRODUCTS.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === active ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
}

function updateTextAndTheme() {
  const p = PRODUCTS[active];

  // Cross-fade the price/name text
  priceCard.classList.add("price-fade-out");
  setTimeout(() => {
    priceName.textContent = p.name;
    priceValue.textContent = p.price;
    priceCard.classList.remove("price-fade-out");
  }, prefersReducedMotion ? 0 : 220);

  // Cross-fade the background gradient
  backLayer.style.background = bgGradient(p);
  requestAnimationFrame(() => {
    frontLayer.style.opacity = "0";
    backLayer.style.opacity = "1";
    const tmp = frontLayer;
    frontLayer = backLayer;
    backLayer = tmp;
  });
}

// direction: 1 = next (right-to-left movement), -1 = prev
function step(direction) {
  if (animating) return;
  animating = true;

  // Find the currently-hidden card (delta === -3) — it is the one
  // that will enter the visible track from the trailing edge.
  const enteringCard = cards.find(
    (c, i) => normalizedDelta(i, active) === -3
  );

  if (direction === 1) {
    // next(): hidden card enters from the RIGHT edge
    applySlot(enteringCard, 3, false);
  } else {
    // prev(): hidden card enters from the LEFT edge
    applySlot(enteringCard, -3, false);
  }
  // Force the snapped (transition:none) position to commit before
  // we switch to the animated position on the next frame.
  void enteringCard.offsetWidth;

  active = ((active + direction) % TOTAL + TOTAL) % TOTAL;

  requestAnimationFrame(() => {
    render(true, direction);
    updateTextAndTheme();
  });

  setTimeout(() => {
    animating = false;
  }, prefersReducedMotion ? 0 : TRANSITION_MS);
}

function goTo(targetIndex) {
  if (animating || targetIndex === active) return;
  resetAutoplay();
  // Choose the shortest circular direction so clicking a dot/card
  // always animates through the nearest path.
  const diff = ((targetIndex - active) % TOTAL + TOTAL) % TOTAL; // 0..5
  const direction = diff <= TOTAL / 2 ? 1 : -1;
  const steps = direction === 1 ? diff : TOTAL - diff;

  let count = 0;
  function chain() {
    if (count >= steps) return;
    step(direction);
    count += 1;
    // small buffer so the previous step has released the `animating` lock
    setTimeout(chain, prefersReducedMotion ? 0 : TRANSITION_MS + 30);
  }
  chain();
}

function next() {
  step(1);
}
function prev() {
  step(-1);
}

// ---- 6. INTERACTIONS -------------------------------------------------------

arrowRight.addEventListener("click", () => {
  resetAutoplay();
  next();
});
arrowLeft.addEventListener("click", () => {
  resetAutoplay();
  prev();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    resetAutoplay();
    next();
  } else if (e.key === "ArrowLeft") {
    resetAutoplay();
    prev();
  }
});

// Swipe support
let touchStartX = null;
carousel.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});
carousel.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) {
    resetAutoplay();
    dx < 0 ? next() : prev();
  }
  touchStartX = null;
});

// Nav pill active-state toggle (purely cosmetic, first icon default)
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ---- 7. AUTOPLAY -------------------------------------------------------

function startAutoplay() {
  if (prefersReducedMotion) return;
  autoplayTimer = setInterval(next, AUTOPLAY_MS);
}
function resetAutoplay() {
  clearInterval(autoplayTimer);
  startAutoplay();
}

// ---- 8. INIT -------------------------------------------------------

frontLayer.style.background = bgGradient(PRODUCTS[active]);
priceName.textContent = PRODUCTS[active].name;
priceValue.textContent = PRODUCTS[active].price;
render(false);
startAutoplay();
