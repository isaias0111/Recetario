export function normalizar(t = "") {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
export function slug(t = "") {
  return normalizar(t).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
