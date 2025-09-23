// header de favoritos
// este modulo se encarga de:
// - insertar un badge en el link "Mis Favoritos" del header
// - mostrar un dropdown con la lista de favoritos
// - permitir abrir o quitar recetas desde el dropdown
// - mantener el contador de favoritos sincronizado en todo momento

import { list, toggle } from "../state/favoritesStore.js"; // funciones para manejar favoritos
import { bus } from "../bus.js"; // event bus para comunicar modulos

// variables que usaremos para referenciar los elementos del header
let anchor, badge, dropdown;

// funcion principal que monta la seccion de favoritos en el header
export function mountHeaderFavorites() {
  // buscamos el link que contiene la palabra "favorit"
  const link = [...document.querySelectorAll(".nav-link")]
    .find(a => a.textContent.trim().toLowerCase().includes("favorit"));
  if (!link) return;

  // creamos un contenedor (anchor) y movemos el link dentro
  anchor = document.createElement("span");
  anchor.className = "fav-anchor";
  link.parentNode.insertBefore(anchor, link);
  anchor.appendChild(link);

  // badge: numerito con la cantidad de favoritos
  badge = document.createElement("span");
  badge.className = "fav-badge";
  badge.hidden = true; // al inicio oculto si no hay favoritos
  anchor.appendChild(badge);

  // dropdown: contenedor con la lista de favoritos
  dropdown = document.createElement("div");
  dropdown.className = "fav-dropdown hidden";
  anchor.appendChild(dropdown);

  // al hacer click en el link se abre/cierra el dropdown
  link.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("hidden");
    renderDropdown();
  });

  // al hacer click fuera, se cierra el dropdown
  document.addEventListener("mousedown", (e) => {
    if (!anchor.contains(e.target)) dropdown.classList.add("hidden");
  });

  // mantener badge sincronizado con los cambios en favoritos
  bus.addEventListener("favorites:change", syncBadge);
  syncBadge(); // actualizamos de entrada
}

// actualiza el badge con la cantidad de favoritos
function syncBadge() {
  if (!badge) return;
  const count = list().length;
  badge.textContent = String(count);
  badge.hidden = count === 0;
  // si el dropdown esta abierto, lo re-renderizamos
  if (!dropdown?.classList.contains("hidden")) renderDropdown();
}

// renderiza el contenido del dropdown con la lista de favoritos
function renderDropdown() {
  const items = list();

  // si hay items, se listan; si no, mensaje vacio
  dropdown.innerHTML = items.length
    ? items.map(i => `
        <div class="fav-item" data-key="${i.key}">
          ${i.image ? `<img src="${i.image}" alt="">` : `<div class="fav-img-ph"></div>`}
          <div class="fav-item-title" title="${i.title}">${i.title}</div>
          <div class="fav-item-actions">
            <button class="fav-btn fav-btn--primary" data-open>Ver</button>
            <button class="fav-btn fav-btn--danger" data-remove>Quitar</button>
          </div>
        </div>
      `).join("")
    : `<div class="fav-empty">No tienes favoritos aun.</div>`;

  // evento: Ver receta (lanza recipe:open y cierra dropdown)
  dropdown.querySelectorAll("[data-open]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const key  = e.currentTarget.closest(".fav-item").dataset.key;
      const meta = list().find(x => x.key === key) || { key };
      bus.dispatchEvent(new CustomEvent("recipe:open", { detail: { key, meta } }));
      dropdown.classList.add("hidden");
    });
  });

  // evento: Quitar receta (actualiza lista pero no cierra dropdown)
  dropdown.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const key = e.currentTarget.closest(".fav-item").dataset.key;
      toggle(key);              // dispara favorites:change
      renderDropdown();         // refresca la vista
      dropdown.querySelector(".fav-item .fav-btn--danger")?.focus?.();
    });
  });
}
