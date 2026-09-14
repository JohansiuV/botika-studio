// ===== Configuración de la tienda =====
const STORE_NAME = "Botica San José";
const WHATSAPP_NUMBER = "51987654321"; // reemplaza por el número real, con código de país
const YAPE_NUMBER = "987 654 321";

// ===== Catálogo de productos =====
const PRODUCTS = [
  // Medicamentos
  { id: "m1", category: "medicamentos", name: "Paracetamol 500mg", pres: "Caja x20 tabletas", price: 8.5, thumb: "a" },
  { id: "m2", category: "medicamentos", name: "Ibuprofeno 400mg", pres: "Caja x10 tabletas", price: 9.9, thumb: "b" },
  { id: "m3", category: "medicamentos", name: "Loratadina 10mg", pres: "Caja x10 tabletas", price: 7.2, thumb: "c" },
  { id: "m4", category: "medicamentos", name: "Suero oral", pres: "Sobre x1", price: 3.5, thumb: "d" },

  // Cuidado personal
  { id: "c1", category: "cuidado", name: "Protector solar FPS50", pres: "Frasco 120ml", price: 34.9, thumb: "b" },
  { id: "c2", category: "cuidado", name: "Jabón neutro dermo", pres: "Barra 90g", price: 6.9, thumb: "c" },
  { id: "c3", category: "cuidado", name: "Shampoo anticaspa", pres: "Frasco 200ml", price: 21.5, thumb: "a" },

  // Vitaminas
  { id: "v1", category: "vitaminas", name: "Multivitamínico", pres: "Frasco x30 cápsulas", price: 22.0, thumb: "c" },
  { id: "v2", category: "vitaminas", name: "Vitamina C 1g", pres: "Tubo x10 efervescentes", price: 14.5, thumb: "a" },
  { id: "v3", category: "vitaminas", name: "Omega 3", pres: "Frasco x60 perlas", price: 29.9, thumb: "b" },

  // Bebés
  { id: "b1", category: "bebes", name: "Pañales talla M", pres: "Paquete x30", price: 39.9, thumb: "d" },
  { id: "b2", category: "bebes", name: "Toallitas húmedas", pres: "Paquete x80", price: 11.9, thumb: "b" },
  { id: "b3", category: "bebes", name: "Leche de fórmula", pres: "Lata 400g", price: 45.0, thumb: "a" },
];

// ===== Estado del carrito (persistente en este navegador) =====
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem("botica-cart");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem("botica-cart", JSON.stringify(cart));
  } catch (e) {
    /* si no hay storage disponible, el carrito solo dura la sesión */
  }
}

// ===== Render del catálogo =====
function renderCatalog() {
  const grids = document.querySelectorAll(".product-grid");
  grids.forEach((grid) => {
    const category = grid.dataset.category;
    const items = PRODUCTS.filter((p) => p.category === category);
    grid.innerHTML = items.map(productCardHTML).join("");
  });

  // contadores por categoría
  document.querySelectorAll("[data-count-for]").forEach((el) => {
    const cat = el.dataset.countFor;
    const count = PRODUCTS.filter((p) => p.category === cat).length;
    el.textContent = `${count} producto${count === 1 ? "" : "s"}`;
  });
}

function productCardHTML(p) {
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-thumb ${p.thumb}" style="background:linear-gradient(160deg, var(--mint), #22A46B);"></div>
      <h4>${p.name}</h4>
      <div class="product-pres">${p.pres}</div>
      <div class="product-price">S/ ${p.price.toFixed(2)}</div>
      <div class="product-actions">
        <div class="qty-stepper">
          <button type="button" data-action="dec" data-id="${p.id}">−</button>
          <span data-qty-display="${p.id}">1</span>
          <button type="button" data-action="inc" data-id="${p.id}">+</button>
        </div>
        <button type="button" class="add-btn" data-action="add" data-id="${p.id}">Agregar</button>
      </div>
    </div>
  `;
}

// contador temporal de cantidad a agregar (no es el carrito aún)
const pendingQty = {};

function handleCatalogClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "inc" || action === "dec") {
    const current = pendingQty[id] || 1;
    const next = action === "inc" ? current + 1 : Math.max(1, current - 1);
    pendingQty[id] = next;
    const display = document.querySelector(`[data-qty-display="${id}"]`);
    if (display) display.textContent = next;
  }

  if (action === "add") {
    const qty = pendingQty[id] || 1;
    addToCart(id, qty);
    pendingQty[id] = 1;
    const display = document.querySelector(`[data-qty-display="${id}"]`);
    if (display) display.textContent = 1;

    btn.textContent = "Agregado ✓";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "Agregar";
      btn.classList.remove("added");
    }, 900);

    showToast(`${qty} × ${PRODUCTS.find((p) => p.id === id).name} agregado al carrito`);
  }
}

// ===== Lógica del carrito =====
function addToCart(id, qty) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  renderCart();
}

function updateQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function getCartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((p) => p.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function getCartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const badgeEl = document.getElementById("cartBadge");
  const entries = Object.entries(cart);

  badgeEl.textContent = getCartCount();

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Tu carrito está vacío.<br><span>Agrega medicamentos, cuidado personal o vitaminas desde el catálogo.</span></p>`;
  } else {
    itemsEl.innerHTML = entries
      .map(([id, qty]) => {
        const p = PRODUCTS.find((p) => p.id === id);
        if (!p) return "";
        return `
          <div class="cart-item" data-id="${id}">
            <div class="ci-thumb" style="background:linear-gradient(160deg, var(--mint), #22A46B);"></div>
            <div class="ci-info">
              <div class="ci-name">${p.name}</div>
              <div class="ci-price">S/ ${p.price.toFixed(2)} c/u</div>
              <div class="ci-actions">
                <div class="qty-stepper">
                  <button type="button" data-cart-action="dec" data-id="${id}">−</button>
                  <span>${qty}</span>
                  <button type="button" data-cart-action="inc" data-id="${id}">+</button>
                </div>
                <button type="button" class="ci-remove" data-cart-action="remove" data-id="${id}">Quitar</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  const total = getCartTotal();
  totalEl.textContent = `S/ ${total.toFixed(2)}`;
  document.getElementById("modalTotal").textContent = `S/ ${total.toFixed(2)}`;
}

function handleCartClick(e) {
  const btn = e.target.closest("button[data-cart-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.cartAction;
  const current = cart[id] || 0;

  if (action === "inc") updateQty(id, current + 1);
  if (action === "dec") updateQty(id, current - 1);
  if (action === "remove") removeFromCart(id);
}

// ===== Drawer del carrito =====
function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

// ===== Modal de pago Yape =====
function openModal() {
  if (getCartCount() === 0) {
    showToast("Agrega productos antes de pagar");
    return;
  }
  buildWhatsAppLink();
  document.getElementById("modalOverlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function buildWhatsAppLink() {
  const lines = Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find((p) => p.id === id);
    return `• ${qty} x ${p.name} — S/ ${(p.price * qty).toFixed(2)}`;
  });
  const total = getCartTotal();
  const message =
    `Hola, quiero hacer este pedido en ${STORE_NAME}:\n\n` +
    lines.join("\n") +
    `\n\nTotal: S/ ${total.toFixed(2)}\n\nAdjunto la captura de mi pago por Yape.`;

  const link = document.getElementById("whatsappOrderBtn");
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ===== Toast =====
let toastTimer;
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ===== Copiar número de Yape =====
function copyYapeNumber() {
  navigator.clipboard?.writeText(YAPE_NUMBER.replace(/\s/g, ""))
    .then(() => showToast("Número de Yape copiado"))
    .catch(() => showToast(YAPE_NUMBER));
}

// ===== Inicialización =====
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderCart();

  document.querySelectorAll(".product-grid").forEach((grid) => {
    grid.addEventListener("click", handleCatalogClick);
  });

  document.getElementById("cartOpenBtn").addEventListener("click", openCart);
  document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("cartItems").addEventListener("click", handleCartClick);
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);

  document.getElementById("payYapeBtn").addEventListener("click", openModal);
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });
  document.getElementById("copyYapeBtn").addEventListener("click", copyYapeNumber);
});
