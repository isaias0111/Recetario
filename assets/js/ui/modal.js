import { getById, getByTitle } from "../data/recipesRepo.js";
import { slug } from "../utils/strings.js";
import { toggle, has } from "../state/favoritesStore.js";
import { bus } from "../bus.js";

let escHandler = null;

export function mountModal() {
  // Cualquier módulo puede pedir abrir una receta
  bus.addEventListener("recipe:open", (e) => {
    const { key, meta } = e.detail || {};
    const receta = getById(key) || getByTitle(meta?.title || "");
    const title  = receta?.title || meta?.title || "Receta";
    const image  = receta?.image || meta?.image || "";
    abrirModal(receta, { titleFallback: title, imgFallback: image, favKey: key });
  });
}

function abrirModal(receta, { titleFallback = "Receta", imgFallback = "", favKey = "" } = {}) {
  cerrarModal();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const modal = document.createElement("div");
  modal.className = "modal-window";
  overlay.appendChild(modal);

  const nombre = receta?.title || titleFallback;
  const imagen = receta?.image || imgFallback;
  const ings   = Array.isArray(receta?.ingredientes) ? receta.ingredientes : [];
  const pasos  = Array.isArray(receta?.pasos) ? receta.pasos : [];
  const key    = favKey || slug(receta?.id || nombre);
  const yaFav  = has(key);

  modal.innerHTML = `
    <button class="modal-close" data-close aria-label="Cerrar">&times;</button>
    <h3 class="modal-title">${nombre}</h3>
    ${imagen ? `<img class="modal-img" src="${imagen}" alt="${nombre}">` : ""}
    <div class="modal-section">
      <h4>Ingredientes</h4>
      ${ ings.length ? `<ul>${ings.map(i => `<li>${i}</li>`).join("")}</ul>` : `<p>Sin detalle de ingredientes.</p>` }
    </div>
    <div class="modal-section">
      <h4>Pasos</h4>
      ${ pasos.length ? `<ol>${pasos.map(p => `<li>${p}</li>`).join("")}</ol>` : `<p>Sin pasos registrados.</p>` }
    </div>
    <div class="modal-actions">
      <button class="btn primary" id="btnFavModal">${yaFav ? "✓ En favoritos" : "Agregar a favoritos"}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // Cierre
  modal.querySelector("[data-close]").addEventListener("click", cerrarModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrarModal(); });
  escHandler = (ev) => { if (ev.key === "Escape") cerrarModal(); };
  document.addEventListener("keydown", escHandler);

  // Toggle de favoritos dentro del modal
  modal.querySelector("#btnFavModal").addEventListener("click", () => {
    const nowFav = toggle(key, { title: nombre, image: imagen });
    modal.querySelector("#btnFavModal").textContent = nowFav ? "✓ En favoritos" : "Agregar a favoritos";
  });
}

function cerrarModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) overlay.remove();
  if (escHandler) { document.removeEventListener("keydown", escHandler); escHandler = null; }
  document.body.style.overflow = "";
}
