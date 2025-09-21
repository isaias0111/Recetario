import { slug } from "../utils/strings.js";
import { toggle, has } from "../state/favoritesStore.js";
import { bus } from "../bus.js";

export function mountCards() {
  // Ver receta (abre modal vía bus)
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const card   = btn.closest(".recipe-card");
      const idAttr = (card?.dataset?.id || "").trim();
      const title  = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const key    = slug(idAttr || title);
      const image  = card?.querySelector("img")?.src || "";

      bus.dispatchEvent(new CustomEvent("recipe:open", {
        detail: { key, meta: { title, image } }
      }));
    });
  });

  // Favorito en tarjetas (toggle)
  document.querySelectorAll(".recipe-card .favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const card  = btn.closest(".recipe-card");
      const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const image = card?.querySelector("img")?.src || "";
      const key   = slug(card?.dataset?.id || title);

      const nowFav = toggle(key, { title, image });
      syncButton(btn, nowFav);
    });

    // Estado inicial
    const card = btn.closest(".recipe-card");
    const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
    const key = slug(card?.dataset?.id || title);
    syncButton(btn, has(key));
  });

  // Cuando cambian favoritos desde otro módulo, refrescamos botones
  bus.addEventListener("favorites:change", () => {
    document.querySelectorAll(".recipe-card .favorite-btn").forEach((btn) => {
      const card  = btn.closest(".recipe-card");
      const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const key   = slug(card?.dataset?.id || title);
      syncButton(btn, has(key));
    });
  });
}

function syncButton(btn, isFav) {
  btn.textContent = isFav ? "✓ Favorito" : "☆ Favorito";
  btn.classList.toggle("is-fav", isFav);
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
}
