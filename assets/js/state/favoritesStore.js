import { bus } from "../bus.js";

const KEYS = "favoritos";
const META = "favoritos_detalle"; // { key: {title, image} }

const readSet  = () => new Set(JSON.parse(localStorage.getItem(KEYS) || "[]"));
const saveSet  = (s) => localStorage.setItem(KEYS, JSON.stringify([...s]));
const readMeta = () => { try { return JSON.parse(localStorage.getItem(META) || "{}"); } catch { return {}; } };
const saveMeta = (o) => localStorage.setItem(META, JSON.stringify(o));

export const has = (key) => readSet().has(key);

export function toggle(key, meta) {
  const keys = readSet();
  const det  = readMeta();

  if (keys.has(key)) {
    keys.delete(key);
    delete det[key];
  } else {
    keys.add(key);
    det[key] = { title: meta?.title || key, image: meta?.image || "" };
  }
  saveSet(keys); saveMeta(det);
  bus.dispatchEvent(new CustomEvent("favorites:change", { detail: { count: keys.size }}));
  return keys.has(key);
}

export function list() {
  const keys = [...readSet()];
  const det  = readMeta();
  return keys.map(k => ({ key: k, title: det[k]?.title || k, image: det[k]?.image || "" }));
}
