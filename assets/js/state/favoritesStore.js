// store de favoritos
// objetivo: guardar y leer favoritos usando localStorage,
// y avisar al resto de la app cuando cambie la cantidad

import { bus } from "../bus.js";

// claves usadas en localStorage
// KEYS: guarda un array con las llaves de favoritos
// META: guarda un objeto con detalles por llave { key: { title, image } }
const KEYS = "favoritos";
const META = "favoritos_detalle"; // { key: {title, image} }

// helpers de lectura/escritura en localStorage
// readSet: devuelve un Set con las llaves guardadas
// saveSet: guarda el Set como array
const readSet  = () => new Set(JSON.parse(localStorage.getItem(KEYS) || "[]"));
const saveSet  = (s) => localStorage.setItem(KEYS, JSON.stringify([...s]));

// readMeta: devuelve el objeto de detalles, si falla retorna {}
// saveMeta: guarda el objeto de detalles
const readMeta = () => { 
  try { 
    return JSON.parse(localStorage.getItem(META) || "{}"); 
  } catch { 
    return {}; 
  } 
};
const saveMeta = (o) => localStorage.setItem(META, JSON.stringify(o));

// has: dice si una receta (key) ya esta marcada como favorito
export const has = (key) => readSet().has(key);

// toggle: marca o desmarca un favorito
// - si ya existe, lo quita y borra su meta
// - si no existe, lo agrega y guarda su titulo/imagen
// al final emite un evento "favorites:change" con el total actualizado
export function toggle(key, meta) {
  const keys = readSet();
  const det  = readMeta();

  if (keys.has(key)) {
    // quitar de favoritos
    keys.delete(key);
    delete det[key];
  } else {
    // agregar a favoritos
    keys.add(key);
    det[key] = { title: meta?.title || key, image: meta?.image || "" };
  }

  // persistir cambios
  saveSet(keys); 
  saveMeta(det);

  // notificar a otros modulos (header, badges, etc.)
  bus.dispatchEvent(
    new CustomEvent("favorites:change", { detail: { count: keys.size } })
  );

  // devolver estado final (true si quedo como favorito)
  return keys.has(key);
}

// list: devuelve un array de favoritos con su informacion basica
// formato: [{ key, title, image }, ...]
export function list() {
  const keys = [...readSet()];
  const det  = readMeta();
  return keys.map(k => ({
    key: k,
    title: det[k]?.title || k,
    image: det[k]?.image || ""
  }));
}
