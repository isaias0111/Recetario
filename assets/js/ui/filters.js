// filtros de recetas
// este modulo se encarga de manejar los botones de categoria y la barra de busqueda
// permite mostrar solo las recetas que cumplen con el filtro seleccionado

export function mountFilters() {
  // seleccionamos elementos del DOM
  const buttons = document.querySelectorAll(".category-btn"); // botones de categorias
  const cards   = document.querySelectorAll(".recipe-card");  // tarjetas de recetas
  const search  = document.getElementById("searchInput");     // input de busqueda

  // guardamos la categoria activa, al inicio no hay filtro
  let activeCategory = null;

  // ---- Filtro por categoria ----
  // cuando se hace click en un boton de categoria:
  // - si ya estaba activo, se desactiva y se muestran todas las recetas
  // - si no estaba activo, se desactiva cualquier otro y se activa este
  // despues se aplican los filtros
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        activeCategory = null;
      } else {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.textContent.trim();
      }
      filterCards();
    });
  });

  // ---- Filtro por texto ----
  // cuando el usuario escribe en el input, se actualizan los resultados
  search.addEventListener("input", () => {
    filterCards();
  });

  // ---- Funcion que aplica filtros ----
  // se encarga de revisar cada tarjeta y decidir si mostrarla o esconderla
  function filterCards() {
    const text = search.value.toLowerCase(); // texto escrito en el buscador

    cards.forEach(card => {
      const category = card.dataset.category.trim(); // categoria de la tarjeta
      const title    = card.querySelector(".recipe-title").textContent.toLowerCase(); // titulo de la receta

      // condicion 1: coincide con la categoria activa o no hay filtro de categoria
      const matchCategory = !activeCategory || category === activeCategory;
      // condicion 2: coincide con el texto escrito o el input esta vacio
      const matchSearch   = !text || title.includes(text);

      // si cumple ambas condiciones, se muestra, si no, se oculta
      if (matchCategory && matchSearch) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }
}
