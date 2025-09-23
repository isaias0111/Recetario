// archivo principal de la aplicacion
// este modulo se encarga de arrancar todas las partes de la pagina
// monta header, carga recetas, pinta tarjetas, activa modal, filtros y footer

import { load } from "./data/recipesRepo.js";         // funcion para cargar recetas desde el json
import { mountHeaderFavorites } from "./ui/headerFavorites.js"; // header con favoritos
import { mountCards } from "./ui/cards.js";           // tarjetas de recetas
import { mountModal } from "./ui/modal.js";           // modal de detalle de receta
import { mountFooter } from "./ui/footer.js";         // footer con año y boton arriba
import { mountFilters } from "./ui/filters.js";       // filtros de categoria y busqueda

// esperamos a que el DOM este listo antes de iniciar
document.addEventListener("DOMContentLoaded", async () => {
  // montar header con favoritos
  mountHeaderFavorites();

  // cargar recetas desde el archivo JSON
  await load("assets/data/recetas.json");

  // montar tarjetas con la data cargada
  mountCards();

  // montar modal de detalle de recetas
  mountModal();

  // montar filtros de busqueda y categorias
  mountFilters();

  // montar footer (año actual y boton volver arriba)
  mountFooter();
});
