import { normalizar, slug } from "../utils/strings.js";

let byId = new Map();
let byName = new Map();

export async function load(url = "assets/data/recetas.json") {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const arr = Array.isArray(data) ? data : (data.recetas || []);

    byId.clear(); byName.clear();
    for (const rec of arr) {
      const id = slug(rec?.id || rec?.title || "");
      const name = rec?.title || "";
      if (id) byId.set(id, { ...rec, id });
      if (name) byName.set(normalizar(name), { ...rec, id });
    }
  } catch (err) {
    console.warn("[recipesRepo] No se pudo cargar recetas:", err);
    byId.clear(); byName.clear();
  }
}

export const getById    = (key)  => byId.get(key) || null;
export const getByTitle = (name) => byName.get(normalizar(name)) || null;
