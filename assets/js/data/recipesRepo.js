// importamos funciones para trabajar con strings
// normalizar: sirve para quitar acentos y caracteres raros
// slug: sirve para convertir un texto en una version simple (ej: "Pollo al Limon" -> "pollo-al-limon")
import { normalizar, slug } from "../utils/strings.js";

// aqui guardaremos las recetas organizadas de dos formas:
// byId: mapa de recetas usando su id unico
// byName: mapa de recetas usando el nombre normalizado
let byId = new Map();
let byName = new Map();

// funcion principal que carga recetas desde un archivo JSON
// recibe una url, por defecto usa "assets/data/recetas.json"
// hace fetch para traer el archivo, lo convierte en JSON
// luego llena los mapas byId y byName con la informacion
export async function load(url = "assets/data/recetas.json") {
  try {
    // pedimos el archivo
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    // convertimos el resultado en JSON
    const data = await r.json();

    // si el JSON es un array lo usamos directo, si no buscamos la propiedad "recetas"
    const arr = Array.isArray(data) ? data : (data.recetas || []);

    // limpiamos los mapas anteriores
    byId.clear(); 
    byName.clear();

    // recorremos cada receta para guardarla
    for (const rec of arr) {
      // sacamos un id unico con slug
      const id = slug(rec?.id || rec?.title || "");
      // guardamos tambien el titulo
      const name = rec?.title || "";

      // si existe id, guardamos la receta en byId
      if (id) byId.set(id, { ...rec, id });

      // si existe nombre, lo normalizamos y guardamos en byName
      if (name) byName.set(normalizar(name), { ...rec, id });
    }
  } catch (err) {
    // si hay error mostramos un warning y limpiamos los mapas
    console.warn("[recipesRepo] No se pudo cargar recetas:", err);
    byId.clear(); 
    byName.clear();
  }
}

// funcion para buscar receta por su id
// devuelve la receta o null si no existe
export const getById = (key) => byId.get(key) || null;

// funcion para buscar receta por su titulo
// normaliza el nombre antes de buscar
// devuelve la receta o null si no existe
export const getByTitle = (name) => byName.get(normalizar(name)) || null;
