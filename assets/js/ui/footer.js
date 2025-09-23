// footer de la pagina
// este modulo se encarga de dos cosas principales:
// - mostrar el año actual en el footer de manera automatica
// - activar el boton que permite volver arriba con un scroll suave

export function mountFooter() {
  // buscamos el span con id="currentYear"
  // si existe, le ponemos el año actual usando Date
  const y = document.getElementById("currentYear");
  if (y) y.textContent = new Date().getFullYear();

  // buscamos el boton con id="toTopBtn"
  // si existe, le agregamos un evento click para hacer scroll hasta arriba
  const toTop = document.getElementById("toTopBtn");
  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }
}
