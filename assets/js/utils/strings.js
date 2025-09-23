// funciones utilitarias para trabajar con strings
// sirven para limpiar textos y generar identificadores unicos

// normalizar:
// - recibe un string
// - quita acentos y caracteres especiales usando normalize("NFD")
// - elimina los diacriticos con regex
// - convierte todo a minusculas
// - quita espacios extras al inicio y al final
export function normalizar(t = "") {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// slug:
// - recibe un string
// - primero lo normaliza (quitar acentos, minusculas, etc.)
// - reemplaza cualquier cosa que no sea letra o numero por guiones
// - quita guiones al inicio o al final
// resultado: texto listo para usarse como id o en urls
export function slug(t = "") {
  return normalizar(t)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
