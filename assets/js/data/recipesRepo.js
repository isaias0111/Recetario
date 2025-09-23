/**
 * recipesRepo.js
 * ---------------------------------------------------------------------------
 * OBJETIVO
 * Cargar recetas desde un archivo JSON y exponer dos consultas rapidas (O(1)):
 *   - getById(id)       -> busca por identificador unico "slug"
 *   - getByTitle(titulo)-> busca por titulo "normalizado" (sin tildes, espacios raros, mayus/minus)
 *
 * - Map: lecturas/escrituras en tiempo constante (O(1)), mas rapido que filtrar arrays.
 * - slug(id|title): garantiza ids limpios/estables (URL-safe, sin espacios, sin mayusculas que podrian romper claves).
 * - normalizar(title): evita fallos por tildes, mayus/minus y espacios (comparacion exacta confiable asi evitamos fallar al filtrar).
 *
 * FORMATO DE ENTRADA SOPORTADO
 * - Array de recetas:            [ { id?, title, imagen, ingredientes, pasos }]
 * - Objeto con propiedad "recetas": { recetas: [ { id?, title, ... }, ... ] }
 *
 * INVARIANTES
 * - Si una receta no trae id, se deriva desde el title usando slug() (si tampoco hay title, no se guarda).
 * - Claves:
 *    byId   -> id (slug)
 *    byName -> normalizar(title)
 * - Si hay duplicados (mismo id o mismo titulo normalizado), la ultima receta le gana a la anterior.
 *
 * ERRORES
 * - Si fetch o parse fallan, se hace console.warn y se limpian ambos mapas para no dejar estados a medias.
 *
 * USO RAPIDO
 *   await load();                          // carga por defecto: "assets/data/recetas.json"
 *   const r1 = getById("pollo-al-limon");  // receta o null
 *   const r2 = getByTitle("POLLO  AL  LIMON"); // misma receta gracias a la normalizacion
 */

import { normalizar, slug } from "../utils/strings.js"; // utilidades para limpiar texto

// Estructuras internas (indices en memoria)
let byId = new Map();   // Mapa: id (slug) -> receta
let byName = new Map(); // Mapa: normalizar(title) -> receta

/**
 * Carga recetas desde un JSON y reconstruye los indices internos.
 *
 * @param {string} [url="assets/data/recetas.json"]
 *   Ruta del archivo JSON. Soporta:
 *   - Array directo de recetas
 *   - Objeto { recetas: [...] }
 *
 * @returns {Promise<void>}
 */
export async function load(url = "assets/data/recetas.json") {
  try {
    // 1) Descarga el archivo
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    // 2) Convierte a objeto JS
    const data = await r.json();

    // 3) Unifica formato (array de recetas)
    const arr = Array.isArray(data) ? data : (data.recetas || []);

    // 4) Limpia indices anteriores (evita mezclas entre cargas)
    byId.clear();
    byName.clear();

    // 5) Indexa cada receta
    for (const rec of arr) {
      // Id candidato: privilegia "rec.id", si no existe deriva desde "rec.title"
      // slug() convierte a un formato estable y seguro para URL/clave
      const id = slug(rec?.id || rec?.title || "");

      // Nombre original (puede ser usado para la clave normalizada)
      const name = rec?.title || "";

      // Guarda por id si existe id
      // Nota: se re-escribe si el id ya estaba (ultimo gana)
      if (id) byId.set(id, { ...rec, id });

      // Guarda por nombre normalizado si hay titulo
      // Esto permite consultas tolerant es a tildes/mayusculas/espacios
      if (name) byName.set(normalizar(name), { ...rec, id });
    }
  } catch (err) {
    // 6) Manejo de errores: registra aviso y deja el repo en estado vacio
    console.warn("[recipesRepo] No se pudo cargar recetas:", err);
    byId.clear();
    byName.clear();
  }
}

/**
 * Obtiene una receta por su id (slug).
 *
 * @param {string} key  Id de la receta (ej: "pollo-al-limon")
 * @returns {object|null}  La receta si existe, de lo contrario null.
 */
export const getById = (key) => byId.get(key) || null;

/**
 * Obtiene una receta por su titulo (normalizado internamente).
 * La busqueda es exacta sobre la version normalizada del titulo:
 *   normalizar("  LIMON  ") === normalizar("limón") -> true
 *
 * @param {string} name  Titulo tal como lo escribe el usuario
 * @returns {object|null}  La receta si existe, de lo contrario null.
 */
export const getByTitle = (name) => byName.get(normalizar(name)) || null;
