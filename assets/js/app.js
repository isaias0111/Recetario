/**
 * =============================================================
 *  Recetas CEUTEC — app.js (documentado)
 *  Funcionalidad:
 *    - Favoritos persistidos en localStorage
 *    - Dropdown “Mis Favoritos (n)” anclado al enlace de la barra
 *    - Modal “Ver receta” con imagen e (opcional) ingredientes/pasos
 *    - Filtro combinado por Categoria + Busqueda de texto
 *
 *  Dependencias de contenido:
 *    - El HTML debe contener:
 *        #recipeContainer con tarjetas .recipe-card
 *        .favorite-btn y .view-btn dentro de cada tarjeta
 *        un enlace .nav-link cuyo texto contenga “Favoritos”
 *        botones .category-btn y un input #searchInput
 *    - assets/data/recetas.json con la forma:
 *        [
 *          { "id": "pollo-al-limon",
 *            "ingredientes": ["...","..."],
 *            "pasos": ["...","..."]
 *          },
 *          ...
 *        ]
 *      El id debe corresponder al slug del titulo de la tarjeta.
 *
 *  Notas de accesibilidad (A11y):
 *    - El modal usa aria-modal y role="dialog"
 *    - Cierre con tecla ESC y click fuera del contenido
 *    - Botones de favorito usan aria-pressed
 *
 *  Autor: Kevin
 * =============================================================
 */

// ===============================
//  Constantes y utilidades
// ===============================

/** Clave de localStorage para favoritos */
const LS_KEY = "favoriteRecipes:v1";

/** Atajo: querySelector */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
/** Atajo: querySelectorAll (Array real) */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/**
 * Convierte un texto a un ID seguro de URL (slug).
 * Elimina acentos, caracteres no alfanumericos y espacios.
 * @param {string} s
 * @returns {string}
 */
const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Lee favoritos desde localStorage.
 * @returns {{id:string,title:string,image:string}[]}
 */
const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
};

/**
 * Escribe el arreglo de favoritos en localStorage.
 * @param {{id:string,title:string,image:string}[]} arr
 */
const setFavorites = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

/**
 * Indica si un ID esta en favoritos.
 * @param {string} id
 * @returns {boolean}
 */
const isFavorite = (id) => getFavorites().some((f) => f.id === id);

// ===============================
//  Referencias al DOM (segun HTML)
// ===============================

/** Contenedor de tarjetas de receta */
const recipeContainer = $("#recipeContainer");

/**
 * Enlace “Mis Favoritos” en la navbar (detectado por texto).
 * Se posiciona como relativo para anclar dropdown.
 */
const favoritesLink = (() => {
  const link = $$(".nav-link").find((a) => /favoritos/i.test(a.textContent));
  if (link) link.style.position = "relative";
  return link;
})();

// ===============================
//  Dropdown “Mis Favoritos”
// ===============================

/** Nodo del dropdown (creado dinamicamente) */
let dropdown;

/**
 * Crea el dropdown si no existe y configura su delegacion de eventos.
 * @returns {HTMLDivElement}
 */
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
    zIndex: "1000",
  });
  document.body.appendChild(dropdown);

  // Delegacion: quitar individual o vaciar todos
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

/**
 * Calcula la posicion del dropdown a partir del enlace “Mis Favoritos”.
 */
function positionDropdown() {
  if (!favoritesLink || !dropdown) return;
  const r = favoritesLink.getBoundingClientRect();
  dropdown.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  dropdown.style.top = `${r.bottom + 8}px`;
}

/**
 * Muestra/oculta el dropdown. Si showExplicit es boolean, lo respeta;
 * si es undefined, alterna el estado actual.
 * @param {boolean} [showExplicit]
 */
function toggleDropdown(showExplicit) {
  ensureDropdown();
  positionDropdown();
  const showing = dropdown.style.display === "block";
  dropdown.style.display = showExplicit ?? !showing ? "block" : "none";

  // Cierre por click fuera
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

/**
 * Actualiza el texto del enlace con el conteo de favoritos.
 */
function updateFavoritesLinkCount() {
  if (!favoritesLink) return;
  const n = getFavorites().length;
  favoritesLink.textContent = `Mis Favoritos (${n})`;
}

/**
 * Renderiza el contenido del dropdown (lista de favoritos y boton “Vaciar”).
 */
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
      <div style="padding:.75rem;text-align:center;color:#777;font-size:.95rem;">Aun no has agregado favoritos.</div>
    `;
    return;
  }

  const items = favs
    .map(
      (f) => `
    <div style="display:flex;align-items:center;gap:.6rem;padding:.5rem;border-radius:.6rem;">
      <img src="${f.image}" alt="${f.title}" style="width:48px;height:48px;object-fit:cover;border-radius:.5rem;">
      <div style="flex:1;font-size:.95rem;font-weight:500;">${f.title}</div>
      <button data-remove="${f.id}" title="Quitar" style="border:none;background:transparent;cursor:pointer;font-size:1.1rem;line-height:1;color:#93061E;">×</button>
    </div>
  `
    )
    .join("");

  dropdown.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:.25rem .25rem .5rem;font-weight:600;color:#93061E">
      <span>Mis favoritos (${favs.length})</span>
      <button data-clear title="Vaciar" style="border:none;background:#FFEBEE;color:#93061E;padding:.35rem .6rem;border-radius:.5rem;cursor:pointer;font-weight:600;">Vaciar</button>
    </div>
    <div>${items}</div>
  `;
}

// ===============================
//  Modal “Ver receta”
// ===============================

/** Overlay del modal (creado dinamicamente) */
let modalOverlay;
/** Contenedor de la tarjeta del modal */
let modalCard;

/**
 * Crea el modal y configura sus manejadores (si no existe).
 * @returns {HTMLDivElement}
 */
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
    zIndex: "1100",
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
    padding: "16px",
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

  // Delegacion dentro del modal (cerrar / toggle favorito)
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

      // Sincronizar UI fuera y dentro del modal
      syncCardsFromStorage();
      renderDropdown();
      markFavButtonInModal(favBtn, !already);
    }
  });

  return modalOverlay;
}

/**
 * Abre el modal con el HTML proporcionado y gestiona foco/scroll.
 * @param {string} html
 */
function openModal(html) {
  ensureModal();
  modalCard.innerHTML = html;
  modalOverlay.style.display = "flex";
  // Bloquear scroll del fondo
  document.body.style.overflow = "hidden";
  // Foco al boton cerrar (si existe) por accesibilidad
  const closeBtn = modalCard.querySelector("[data-close-modal]");
  closeBtn?.focus?.();
}

/** Cierra el modal y restaura el scroll */
function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.style.display = "none";
  document.body.style.overflow = "";
}

/**
 * Aplica aspecto visual de favorito a un boton dentro del modal.
 * @param {HTMLButtonElement} btn
 * @param {boolean} fav
 */
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

/**
 * Construye y muestra el modal de una receta.
 * Intenta enriquecer con ingredientes/pasos desde recetas.json (si cargo).
 * @param {{id:string,title:string,image:string}} info
 */
function buildRecipeModal(info) {
  const receta = recetaData.find((r) => r.id === info.id);
  const fav = isFavorite(info.id);

  // Cabecera del modal
  const header = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
      <h2 style="margin:0;font-size:1.4rem;color:#222;">${info.title}</h2>
      <button data-close-modal title="Cerrar"
        style="border:none;background:#FFEBEE;color:#93061E;padding:.45rem .7rem;border-radius:.5rem;cursor:pointer;font-weight:600">Cerrar</button>
    </div>
  `;

  // Imagen destacada
  const image = `
    <img src="${info.image}" alt="${info.title}"
      style="width:100%;height:320px;object-fit:cover;border-radius:12px;margin-bottom:12px;">
  `;

  // Acciones (favorito en modal)
  const actions = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <button data-modal-fav data-id="${info.id}" data-title="${info.title}" data-image="${info.image}"></button>
    </div>
  `;

  // Contenido dinamico: ingredientes/pasos si existen en recetas.json
  const ingredientes = Array.isArray(receta?.ingredientes)
    ? receta.ingredientes
    : [];
  const pasos = Array.isArray(receta?.pasos) ? receta.pasos : [];

  const ingredientesHTML = ingredientes.length
    ? "<ul>" + ingredientes.map((i) => `<li>${i}</li>`).join("") + "</ul>"
    : "<p style='color:#666'>Ingredientes no disponibles.</p>";

  const pasosHTML = pasos.length
    ? "<ol>" + pasos.map((p) => `<li>${p}</li>`).join("") + "</ol>"
    : "<p style='color:#666'>Pasos no disponibles.</p>";

  const body = `
    <div style="color:#444;line-height:1.6;font-size:.98rem">
      <h3>Ingredientes</h3>
      ${ingredientesHTML}
      <h3>Pasos</h3>
      ${pasosHTML}
    </div>
  `;

  // Montaje final y apertura
  const html = header + image + actions + body;
  openModal(html);

  // Ajustar estado visual del boton de favorito del modal
  const favBtn = modalCard.querySelector("[data-modal-fav]");
  if (favBtn) markFavButtonInModal(favBtn, fav);
}

// ===============================
//  Logica de tarjetas / favoritos
// ===============================

/**
 * Extrae {id,title,image} de una .recipe-card del grid.
 * @param {HTMLElement} card
 * @returns {{id:string,title:string,image:string}}
 */
function cardInfoFromElement(card) {
  const titleEl = card.querySelector(".recipe-title");
  const imgEl = card.querySelector("img");
  const title = (titleEl?.textContent || "").trim();
  const id = slug(title);
  const image = imgEl?.getAttribute("src") || "";
  return { id, title, image };
}

/**
 * Ajusta el estilo y texto de un boton de favorito en tarjeta.
 * @param {HTMLButtonElement} btn
 * @param {boolean} fav
 */
function markButton(btn, fav) {
  btn.textContent = fav ? "★ Favorito" : "☆ Favorito";
  btn.setAttribute("aria-pressed", fav ? "true" : "false");
  btn.style.background = fav ? "#FFEBEE" : "white";
  btn.style.borderColor = fav ? "#DF1B3B" : "#ccc";
  btn.style.color = fav ? "#93061E" : "#333";
  btn.style.fontWeight = fav ? "600" : "400";
}

/**
 * Sincroniza todos los botones de tarjeta segun localStorage
 * y actualiza el contador del enlace “Mis Favoritos”.
 */
function syncCardsFromStorage() {
  const favs = getFavorites();
  const ids = new Set(favs.map((f) => f.id));

  $$(".recipe-card").forEach((card) => {
    const btn = card.querySelector(".favorite-btn");
    if (!btn) return;
    const { id } = cardInfoFromElement(card);
    markButton(btn, ids.has(id));
  });

  updateFavoritesLinkCount();
}

/**
 * Agrega una receta a favoritos, si no existe.
 * @param {{id:string,title:string,image:string}} recipe
 */
function addFavorite(recipe) {
  const favs = getFavorites();
  if (!favs.some((f) => f.id === recipe.id)) {
    favs.push(recipe);
    setFavorites(favs);
  }
}

/**
 * Elimina una receta de favoritos por ID.
 * @param {string} id
 */
function removeFavorite(id) {
  const favs = getFavorites().filter((f) => f.id !== id);
  setFavorites(favs);
}

// ===============================
//  Eventos globales e inicializacion
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Preasignar data-id a cada tarjeta (desde su titulo)
  $$(".recipe-card").forEach((card) => {
    const { id } = cardInfoFromElement(card);
    card.dataset.id = id;
  });

  // Estado inicial de favoritos y dropdown
  syncCardsFromStorage();
  renderDropdown();

  // Delegacion de clicks en el grid:
  //  - .favorite-btn: alternar favorito
  //  - .view-btn: abrir modal de receta
  if (recipeContainer) {
    recipeContainer.addEventListener("click", (e) => {
      // Toggle favorito (en tarjeta)
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

      // Ver receta (abre modal)
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

  // Enlace “Mis Favoritos”: abrir dropdown
  if (favoritesLink) {
    favoritesLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderDropdown();
      positionDropdown();
      toggleDropdown(true);
    });
  }

  // Reposicionar dropdown en resize/scroll
  window.addEventListener("resize", positionDropdown);
  window.addEventListener("scroll", positionDropdown);
});

// Mantener favoritos sincronizados entre pestanas/ventanas
window.addEventListener("storage", (e) => {
  if (e.key === LS_KEY) {
    syncCardsFromStorage();
    renderDropdown();
  }
});

// ===============================
//  Filtros: Categoria + Busqueda
// ===============================

/** Botones de categoria definidos en el HTML */
const categoryButtons = $$(".category-btn");
/** Categoria seleccionada (o “Todos” si no hay filtro activo) */
let selectedCategory = "Todos";

/**
 * Manejo de seleccion de categoria.
 *  - Clic en la misma categoria: desactiva filtro
 *  - Clic en otra categoria: activa esa y quita las demas
 */
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.textContent.trim();

    if (selectedCategory === category) {
      // Si re-clic en la misma, quitar filtro
      selectedCategory = "Todos";
      btn.classList.remove("active");
    } else {
      selectedCategory = category;
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    }

    applyFilters();
  });
});

/** Input de busqueda por texto */
const searchInput = $("#searchInput");
if (searchInput) {
  // Filtra en tiempo real al escribir
  searchInput.addEventListener("input", () => {
    applyFilters();
  });
}

/**
 * Aplica el filtro combinado:
 *   - Categoria (selectedCategory vs data-category)
 *   - Busqueda de texto en el titulo
 */
function applyFilters() {
  const search = (searchInput?.value || "").toLowerCase();

  $$(".recipe-card").forEach((card) => {
    const title =
      card.querySelector(".recipe-title")?.textContent.toLowerCase() || "";
    const category = card.dataset.category || "";
    const matchesCategory =
      selectedCategory === "Todos" || selectedCategory === category;
    const matchesSearch = title.includes(search);

    card.style.display = matchesCategory && matchesSearch ? "" : "none";
  });
}

// ===============================
//  Datos externos de receta (opcional)
//  Carga asincrona de assets/data/recetas.json
// ===============================

/**
 * Contiene el catalogo enriquecido (ingredientes/pasos) si existe recetas.json.
 * @type {{id:string, ingredientes?:string[], pasos?:string[]}[]}
 */
let recetaData = [];

// Carga opcional: si el archivo no existe o falla, simplemente se omite el enriquecimiento.
fetch("assets/data/recetas.json")
  .then((res) => res.json())
  .then((data) => {
    recetaData = Array.isArray(data) ? data : [];
  })
  .catch((err) => {
    console.warn(
      "No se pudo cargar assets/data/recetas.json (modal mostrara solo imagen/titulo). Detalle:",
      err
    );
  });
