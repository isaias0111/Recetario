import { list, toggle } from "../state/favoritesStore.js";
import { bus } from "../bus.js";

let anchor, badge, dropdown;

export function mountHeaderFavorites() {
  const link = [...document.querySelectorAll(".nav-link")]
    .find(a => a.textContent.trim().toLowerCase().includes("favorit"));
  if (!link) return;

  anchor = document.createElement("span");
  anchor.className = "fav-anchor";
  link.parentNode.insertBefore(anchor, link);
  anchor.appendChild(link);

  badge = document.createElement("span");
  badge.className = "fav-badge";
  badge.hidden = true;
  anchor.appendChild(badge);

  dropdown = document.createElement("div");
  dropdown.className = "fav-dropdown hidden";
  anchor.appendChild(dropdown);

  link.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("hidden");
    renderDropdown();
  });

  document.addEventListener("mousedown", (e) => {
    if (!anchor.contains(e.target)) dropdown.classList.add("hidden");
  });

  // Mantén badge sincronizado
  bus.addEventListener("favorites:change", syncBadge);
  syncBadge();
}

function syncBadge() {
  if (!badge) return;
  const count = list().length;
  badge.textContent = String(count);
  badge.hidden = count === 0;
  if (!dropdown?.classList.contains("hidden")) renderDropdown();
}

function renderDropdown() {
  const items = list();
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
    : `<div class="fav-empty">No tienes favoritos aún.</div>`;

  // Ver receta → se cierra dropdown
  dropdown.querySelectorAll("[data-open]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const key  = e.currentTarget.closest(".fav-item").dataset.key;
      const meta = list().find(x => x.key === key) || { key };
      bus.dispatchEvent(new CustomEvent("recipe:open", { detail: { key, meta } }));
      dropdown.classList.add("hidden");
    });
  });

  // Quitar → NO se cierra; re-render y mantiene foco
  dropdown.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const key = e.currentTarget.closest(".fav-item").dataset.key;
      toggle(key);              // dispara favorites:change
      renderDropdown();         // mantener abierto y actualizado
      dropdown.querySelector(".fav-item .fav-btn--danger")?.focus?.();
    });
  });
}
