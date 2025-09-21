export function mountFooter() {
  const y = document.getElementById("currentYear");
  if (y) y.textContent = new Date().getFullYear();

  const toTop = document.getElementById("toTopBtn");
  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }
}
