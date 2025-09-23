// modal de receta
// este modulo abre una ventana modal con el detalle de una receta
// obtiene la receta por id o por titulo, muestra ingredientes y pasos
// permite agregar o quitar de favoritos desde el mismo modal

import { getById, getByTitle } from "../data/recipesRepo.js"; // buscar recetas en el repo
import { slug } from "../utils/strings.js";                    // generar claves limpias
import { toggle, has } from "../state/favoritesStore.js";      // manejar favoritos
import { bus } from "../bus.js";                               // event bus para abrir modal desde otros modulos

let escHandler = null; // guardamos referencia para quitar el listener de Escape

// funcion que registra el listener global para abrir recetas
export function mountModal() {
  // cualquier modulo puede disparar "recipe:open" para abrir el modal
  bus.addEventListener("recipe:open", (e) => {
    const { key, meta } = e.detail || {};
    // intentamos obtener la receta por id, si no, por titulo
    const receta = getById(key) || getByTitle(meta?.title || "");
    // valores de respaldo por si faltan datos en la receta
    const title  = receta?.title || meta?.title || "Receta";
    const image  = receta?.image || meta?.image || "";
    // abrimos modal con la receta y fallbacks
    abrirModal(receta, { titleFallback: title, imgFallback: image, favKey: key });
  });
}

// crea y muestra el modal en el DOM
function abrirModal(
  receta,
  { titleFallback = "Receta", imgFallback = "", favKey = "" } = {}
) {
  // cerramos cualquier modal anterior
  cerrarModal();

  // estructura base del modal: overlay y ventana
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const modal = document.createElement("div");
  modal.className = "modal-window";
  overlay.appendChild(modal);

  // datos de la receta con valores de respaldo
  const nombre = receta?.title || titleFallback;
  const imagen = receta?.image || imgFallback;
  const ings   = Array.isArray(receta?.ingredientes) ? receta.ingredientes : [];
  const pasos  = Array.isArray(receta?.pasos) ? receta.pasos : [];
  const key    = favKey || slug(receta?.id || nombre); // clave unica para favoritos
  const yaFav  = has(key); // saber si ya es favorito

  // html del modal (titulo, imagen, ingredientes, pasos y boton de favorito)
  modal.innerHTML = `
    <button class="modal-close" data-close aria-label="Cerrar">&times;</button>
    <h3 class="modal-title">${nombre}</h3>
    ${imagen ? `<img class="modal-img" src="${imagen}" alt="${nombre}">` : ""}

    <div class="modal-section">
      <h4>Ingredientes</h4>
      ${
        ings.length
          ? `<ul>${ings.map(i => `<li>${i}</li>`).join("")}</ul>`
          : `<p>Sin detalle de ingredientes.</p>`
      }
    </div>

    <div class="modal-section">
      <h4>Pasos</h4>
      ${
        pasos.length
          ? `<ol>${pasos.map(p => `<li>${p}</li>`).join("")}</ol>`
          : `<p>Sin pasos registrados.</p>`
      }
    </div>

    <div class="modal-actions">
      <button class="btn primary" id="btnFavModal">
        ${yaFav ? "✓ En favoritos" : "Agregar a favoritos"}
      </button>
    </div>
  `;

  // insertamos en el documento y bloqueamos scroll del body
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // cierre por boton X
  modal.querySelector("[data-close]").addEventListener("click", cerrarModal);

  // cierre por click fuera del modal (en el overlay)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarModal();
  });

  // cierre por tecla Escape
  escHandler = (ev) => {
    if (ev.key === "Escape") cerrarModal();
  };
  document.addEventListener("keydown", escHandler);

  // boton para agregar o quitar de favoritos dentro del modal
  modal.querySelector("#btnFavModal").addEventListener("click", () => {
    const nowFav = toggle(key, { title: nombre, image: imagen });
    // actualizamos el texto del boton segun el nuevo estado
    modal.querySelector("#btnFavModal").textContent =
      nowFav ? "✓ En favoritos" : "Agregar a favoritos";
  });
}

// elimina el modal del DOM y limpia listeners
function cerrarModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) overlay.remove();

  // quitamos el listener de Escape si estaba registrado
  if (escHandler) {
    document.removeEventListener("keydown", escHandler);
    escHandler = null;
  }

  // restauramos el scroll del body
  document.body.style.overflow = "";
}
