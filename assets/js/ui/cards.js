// manejo de las tarjetas de recetas
// este modulo se encarga de:
// - abrir el modal cuando el usuario quiere ver una receta
// - permitir marcar o desmarcar favoritos
// - sincronizar el estado de los botones de favoritos

import { slug } from "../utils/strings.js";           // para crear ids unicos a partir de textos
import { toggle, has } from "../state/favoritesStore.js"; // funciones para manejar favoritos
import { bus } from "../bus.js";                     // event bus para comunicar modulos

// funcion principal que activa los eventos en las tarjetas
export function mountCards() {
  // ----- Ver receta -----
  // cada boton "Ver receta" abre un modal
  // se busca la tarjeta mas cercana (recipe-card) para obtener info
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();

      const card   = btn.closest(".recipe-card"); // tarjeta completa
      const idAttr = (card?.dataset?.id || "").trim(); // id en data-id (si existe)
      const title  = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const key    = slug(idAttr || title); // generamos clave unica
      const image  = card?.querySelector("img")?.src || "";

      // se lanza un evento al bus para que otro modulo abra el modal
      bus.dispatchEvent(new CustomEvent("recipe:open", {
        detail: { key, meta: { title, image } }
      }));
    });
  });

  // ----- Favoritos -----
  // los botones con clase favorite-btn activan toggle de favoritos
  document.querySelectorAll(".recipe-card .favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();

      const card  = btn.closest(".recipe-card");
      const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const image = card?.querySelector("img")?.src || "";
      const key   = slug(card?.dataset?.id || title);

      // cambiamos estado en el store
      const nowFav = toggle(key, { title, image });

      // actualizamos el boton segun el nuevo estado
      syncButton(btn, nowFav);
    });

    // configuramos el estado inicial del boton
    const card = btn.closest(".recipe-card");
    const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
    const key = slug(card?.dataset?.id || title);
    syncButton(btn, has(key));
  });

  // ----- Escuchar cambios globales de favoritos -----
  // si se cambian favoritos desde otro modulo (ej: header),
  // refrescamos todos los botones de las tarjetas
  bus.addEventListener("favorites:change", () => {
    document.querySelectorAll(".recipe-card .favorite-btn").forEach((btn) => {
      const card  = btn.closest(".recipe-card");
      const title = card?.querySelector(".recipe-title")?.textContent?.trim() || "";
      const key   = slug(card?.dataset?.id || title);
      syncButton(btn, has(key));
    });
  });
}

// funcion auxiliar que cambia el aspecto del boton segun si es favorito o no
// - cambia el texto
// - agrega o quita clase css "is-fav"
// - actualiza aria-pressed para accesibilidad
function syncButton(btn, isFav) {
  btn.textContent = isFav ? "✓ Favorito" : "☆ Favorito";
  btn.classList.toggle("is-fav", isFav);
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
}
