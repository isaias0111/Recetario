// Event bus muy simple para comunicar módulos sin acoplarlos.
export const bus = new EventTarget();
// Eventos usados:
//  - "favorites:change"  detail:{count}
//  - "recipe:open"       detail:{key, meta:{title?, image?}}
