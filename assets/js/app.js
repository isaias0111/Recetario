// ===============================
//  Recetas CEUTEC - JS standalone
//  - Favoritos con localStorage
//  - Dropdown "Mis Favoritos (n)"
//  - Modal para "Ver receta"
// ===============================

// --- Helpers básicos ---
const LS_KEY = "favoriteRecipes:v1";
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const slug = (s) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};
const setFavorites = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const isFavorite = (id) => getFavorites().some(f => f.id === id);

// --- Elementos del DOM según tu HTML ---
const recipeContainer = $("#recipeContainer");
const favoritesLink = (() => {
  const link = $$(".nav-link").find(a => /favoritos/i.test(a.textContent));
  if (link) link.style.position = "relative";
  return link;
})();

// ===============================
// Dropdown "Mis Favoritos"
// ===============================
let dropdown;

function ensureDropdown() {
  if (dropdown) return dropdown;
  dropdown = document.createElement("div");
  dropdown.id = "favoritesDropdown";
  Object.assign(dropdown.style, {
    position: "fixed",
    display: "none",
    width: "320px",
    maxHeight: "70vh",
    overflowY: "auto",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,.08)",
    padding: "8px",
    zIndex: "1000"
  });
  document.body.appendChild(dropdown);

  dropdown.addEventListener("click", (e) => {
    const btnRemove = e.target.closest("[data-remove]");
    if (btnRemove) {
      const id = btnRemove.getAttribute("data-remove");
      removeFavorite(id);
      renderDropdown();
      syncCardsFromStorage();
      return;
    }
    const btnClear = e.target.closest("[data-clear]");
    if (btnClear) {
      setFavorites([]);
      renderDropdown();
      syncCardsFromStorage();
      return;
    }
  });

  return dropdown;
}

function positionDropdown() {
  if (!favoritesLink || !dropdown) return;
  const r = favoritesLink.getBoundingClientRect();
  dropdown.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  dropdown.style.top = `${r.bottom + 8}px`;
}

function toggleDropdown(showExplicit) {
  ensureDropdown();
  positionDropdown();
  const showing = dropdown.style.display === "block";
  dropdown.style.display = (showExplicit ?? !showing) ? "block" : "none";

  if (dropdown.style.display === "block") {
    setTimeout(() => {
      const closeHandler = (ev) => {
        if (!dropdown.contains(ev.target) && ev.target !== favoritesLink) {
          dropdown.style.display = "none";
          document.removeEventListener("click", closeHandler);
        }
      };
      document.addEventListener("click", closeHandler);
    }, 0);
  }
}

function updateFavoritesLinkCount() {
  if (!favoritesLink) return;
  const n = getFavorites().length;
  favoritesLink.textContent = `Mis Favoritos (${n})`;
}

function renderDropdown() {
  ensureDropdown();
  updateFavoritesLinkCount();

  const favs = getFavorites();
  if (!favs.length) {
    dropdown.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:.25rem .25rem .5rem;font-weight:600;color:#93061E">
        <span>Mis favoritos</span>
        <button data-clear disabled style="border:none;background:#FFEBEE;color:#93061E;padding:.35rem .6rem;border-radius:.5rem;font-weight:600;opacity:.6;cursor:not-allowed;">Vaciar</button>
      </div>
      <div style="padding:.75rem;text-align:center;color:#777;font-size:.95rem;">Aún no has agregado favoritos.</div>
    `;
    return;
  }

  const items = favs.map(f => `
    <div style="display:flex;align-items:center;gap:.6rem;padding:.5rem;border-radius:.6rem;">
      <img src="${f.image}" alt="${f.title}" style="width:48px;height:48px;object-fit:cover;border-radius:.5rem;">
      <div style="flex:1;font-size:.95rem;font-weight:500;">${f.title}</div>
      <button data-remove="${f.id}" title="Quitar" style="border:none;background:transparent;cursor:pointer;font-size:1.1rem;line-height:1;color:#93061E;">×</button>
    </div>
  `).join("");

  dropdown.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:.25rem .25rem .5rem;font-weight:600;color:#93061E">
      <span>Mis favoritos (${favs.length})</span>
      <button data-clear title="Vaciar" style="border:none;background:#FFEBEE;color:#93061E;padding:.35rem .6rem;border-radius:.5rem;cursor:pointer;font-weight:600;">Vaciar</button>
    </div>
    <div>${items}</div>
  `;
}

// ===============================
// Modal "Ver receta"
// ===============================
let modalOverlay;
let modalCard; // el contenedor interno

function ensureModal() {
  if (modalOverlay) return modalOverlay;

  modalOverlay = document.createElement("div");
  Object.assign(modalOverlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,.5)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: "1100"
  });
  modalOverlay.setAttribute("role", "dialog");
  modalOverlay.setAttribute("aria-modal", "true");

  modalCard = document.createElement("div");
  Object.assign(modalCard.style, {
    width: "min(90vw, 780px)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,.2)",
    padding: "16px"
  });

  modalOverlay.appendChild(modalCard);
  document.body.appendChild(modalOverlay);

  // Cierre por click fuera
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Cierre con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.style.display === "flex") {
      closeModal();
    }
  });

  // Delegación dentro del modal (cerrar / fav toggle)
  modalCard.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close-modal]");
    if (closeBtn) {
      closeModal();
      return;
    }

    const favBtn = e.target.closest("[data-modal-fav]");
    if (favBtn) {
      const id = favBtn.getAttribute("data-id");
      const title = favBtn.getAttribute("data-title");
      const image = favBtn.getAttribute("data-image");
      const already = isFavorite(id);
      if (already) removeFavorite(id);
      else addFavorite({ id, title, image });

      // Sincronizar UI
      syncCardsFromStorage();
      renderDropdown();
      // Refrescar estado del botón dentro del modal
      markFavButtonInModal(favBtn, !already);
    }
  });

  return modalOverlay;
}

function openModal(html) {
  ensureModal();
  modalCard.innerHTML = html;
  modalOverlay.style.display = "flex";
  // bloquear scroll de fondo
  document.body.style.overflow = "hidden";
  // foco al botón cerrar si existe
  const closeBtn = modalCard.querySelector("[data-close-modal]");
  closeBtn?.focus?.();
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.style.display = "none";
  document.body.style.overflow = ""; // restaurar
}

function markFavButtonInModal(btn, fav) {
  btn.textContent = fav ? "★ Favorito" : "☆ Favorito";
  btn.setAttribute("aria-pressed", fav ? "true" : "false");
  btn.style.background = fav ? "#FFEBEE" : "white";
  btn.style.border = "1px solid " + (fav ? "#DF1B3B" : "#ccc");
  btn.style.color = fav ? "#93061E" : "#333";
  btn.style.padding = ".6rem 1rem";
  btn.style.borderRadius = ".6rem";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = fav ? "600" : "400";
}

function buildRecipeModal(info) {
  const receta = recetaData.find(r => r.id === info.id);
  const fav = isFavorite(info.id);

  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
      <h2 style="margin:0;font-size:1.4rem;color:#222;">${info.title}</h2>
      <button data-close-modal title="Cerrar"
        style="border:none;background:#FFEBEE;color:#93061E;padding:.45rem .7rem;border-radius:.5rem;cursor:pointer;font-weight:600">Cerrar</button>
    </div>
  `;

  const image = `
    <img src="${info.image}" alt="${info.title}"
      style="width:100%;height:320px;object-fit:cover;border-radius:12px;margin-bottom:12px;">
  `;

  const actions = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <button data-modal-fav data-id="${info.id}" data-title="${info.title}" data-image="${info.image}"></button>
    </div>
  `;

  let ingredientesHTML = "<ul>" + receta.ingredientes.map(i => `<li>${i}</li>`).join("") + "</ul>";
  let pasosHTML = "<ol>" + receta.pasos.map(p => `<li>${p}</li>`).join("") + "</ol>";

  const body = `
    <div style="color:#444;line-height:1.6;font-size:.98rem">
      <h3>Ingredientes</h3>
      ${ingredientesHTML}
      <h3>Pasos</h3>
      ${pasosHTML}
    </div>
  `;

  const html = header + image + actions + body;
  openModal(html);

  const favBtn = modalCard.querySelector("[data-modal-fav]");
  if (favBtn) markFavButtonInModal(favBtn, fav);
}


// ===============================
// Lógica para tarjetas / favoritos
// ===============================
function cardInfoFromElement(card) {
  const titleEl = card.querySelector(".recipe-title");
  const imgEl = card.querySelector("img");
  const title = (titleEl?.textContent || "").trim();
  const id = slug(title);
  const image = imgEl?.getAttribute("src") || "";
  return { id, title, image };
}

function markButton(btn, fav) {
  btn.textContent = fav ? "★ Favorito" : "☆ Favorito";
  btn.setAttribute("aria-pressed", fav ? "true" : "false");
  btn.style.background = fav ? "#FFEBEE" : "white";
  btn.style.borderColor = fav ? "#DF1B3B" : "#ccc";
  btn.style.color = fav ? "#93061E" : "#333";
  btn.style.fontWeight = fav ? "600" : "400";
}

function syncCardsFromStorage() {
  const favs = getFavorites();
  const ids = new Set(favs.map(f => f.id));

  $$(".recipe-card").forEach(card => {
    const btn = card.querySelector(".favorite-btn");
    if (!btn) return;
    const { id } = cardInfoFromElement(card);
    markButton(btn, ids.has(id));
  });

  updateFavoritesLinkCount();
}

function addFavorite(recipe) {
  const favs = getFavorites();
  if (!favs.some(f => f.id === recipe.id)) {
    favs.push(recipe);
    setFavorites(favs);
  }
}

function removeFavorite(id) {
  const favs = getFavorites().filter(f => f.id !== id);
  setFavorites(favs);
}

// ===============================
// Eventos globales
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Preasignar data-id en cards
  $$(".recipe-card").forEach(card => {
    const { id } = cardInfoFromElement(card);
    card.dataset.id = id;
  });

  syncCardsFromStorage();
  renderDropdown();

  // Click en "☆/★ Favorito"
  if (recipeContainer) {
    recipeContainer.addEventListener("click", (e) => {
      // Toggle favorito
      const btnFav = e.target.closest(".favorite-btn");
      if (btnFav) {
        const card = e.target.closest(".recipe-card");
        if (!card) return;
        const info = cardInfoFromElement(card);
        const already = isFavorite(info.id);
        if (already) removeFavorite(info.id);
        else addFavorite(info);

        syncCardsFromStorage();
        renderDropdown();
        return;
      }

      // Ver receta (modal)
      const btnView = e.target.closest(".view-btn");
      if (btnView) {
        const card = e.target.closest(".recipe-card");
        if (!card) return;
        const info = cardInfoFromElement(card);
        buildRecipeModal(info);
        return;
      }
    });
  }

  // Abrir/cerrar dropdown al hacer click en "Mis Favoritos"
  if (favoritesLink) {
    favoritesLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderDropdown();
      positionDropdown();
      toggleDropdown(true);
    });
  }

  // Reposicionar dropdown
  window.addEventListener("resize", positionDropdown);
  window.addEventListener("scroll", positionDropdown);
});
// ===============================
// Filtrado por categoría
// ===============================
const categoryButtons = $$(".category-btn");
let selectedCategory = "Todos"; // valor inicial

categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.textContent.trim();

    // Si ya está seleccionada, desactiva el filtro
    if (selectedCategory === category) {
      selectedCategory = "Todos"; // quitar filtro
      btn.classList.remove("active");
    } else {
      selectedCategory = category;
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }

    applyFilters(); // aplicar filtros combinados
  });
});

// ===============================
// Filtro por búsqueda
// ===============================
const searchInput = $("#searchInput");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    applyFilters(); // aplicar filtros combinados
  });
}

// ===============================
// Función combinada de filtrado
// ===============================
function applyFilters() {
  const search = (searchInput?.value || "").toLowerCase();

  $$(".recipe-card").forEach(card => {
    const title = card.querySelector(".recipe-title")?.textContent.toLowerCase();
    const category = card.dataset.category;
    const matchesCategory = selectedCategory === "Todos" || selectedCategory === category;
    const matchesSearch = title?.includes(search);

    card.style.display = matchesCategory && matchesSearch ? "" : "none";
  });
}

// Sincronizar entre pestañas/ventanas
window.addEventListener('storage', (e) => {
  if (e.key === LS_KEY) {
    syncCardsFromStorage();
    renderDropdown();
  }
});
let recetaData = [];

fetch("assets/data/recetas.json")
  .then(res => res.json())
  .then(data => {
    recetaData = data;
  })
  .catch(err => {
    console.error("Error al cargar recetas.json:", err);
  });
