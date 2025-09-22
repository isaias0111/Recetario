# Recetas CEUTEC

Aplicación web estática para **buscar recetas**, ver el detalle en un **modal** y gestionar **favoritos** con `localStorage`.  
Arquitectura **vanilla JS** con **ES Modules**, CSS segmentado y sin frameworks.

## TL;DR

- Ejecuta un **servidor local** (Live Server, Vite, `npx serve`, etc.).
- Abre `index.html`.
- Modal y favoritos listos. Persistencia en el navegador.

---

## Puesta en marcha

### Requisitos
- Cualquier servidor estático. Ejemplos:
  - VS Code → extensión **Live Server** (click derecho → *Open with Live Server*).
  - Node: `npx serve` (en la carpeta del proyecto).
  - Python: `python -m http.server 8080`.

> **Importante**: los ES Modules y el `fetch` del JSON **no funcionan** con `file://`. Usa HTTP.

### Rutas clave
- App: `http://localhost:PORT/index.html`
- Datos: `assets/data/recetas.json`

---

## Estructura del proyecto

```
assets/
  css/
    base.css         # Reset/base + tipografía + utilidades
    header.css       # Navbar / navegación
    banner.css       # Hero superior
    filters.css      # Filtros y buscador
    cards.css        # Tarjetas de recetas (grid)
    modal.css        # Estilos del modal
    favorites.css    # Dropdown "Mis Favoritos"
    footer.css       # Footer / redes / copy
    responsive.css   # Media queries y ajustes móviles

  data/
    recetas.json     # Fuente de datos (recetas)

  images/            # Imágenes de tarjetas y branding

  js/
    app.js           # Bootstrap de la app: monta UI y carga datos
    bus.js           # Event Bus simple (CustomEvent)

    utils/
      strings.js     # normalizar(), slug()

    data/
      recipesRepo.js # Carga/indexa recetas; getters (por id/título)

    state/
      favoritesStore.js  # Estado de favoritos en localStorage

    ui/
      headerFavorites.js # Badge + dropdown de favoritos
      cards.js           # Wire de botones en tarjetas (ver/añadir fav)
      modal.js           # Modal de receta (escucha "recipe:open")
      footer.js          # Año actual + botón "volver arriba" (opcional)
```

**index.html** solo incluye **un** script:
```html
<script type="module" src="assets/js/app.js"></script>
```

---

## Flujo de la app

1. `app.js` espera `DOMContentLoaded`, carga `assets/data/recetas.json` con `recipesRepo.load(...)` e **indexa** por `id` y por nombre normalizado.
2. Monta UI:
   - `headerFavorites`: badge + dropdown “Mis Favoritos”.
   - `cards`: botones “Ver receta” y “☆/✓ Favorito”.
   - `modal`: escucha `recipe:open` y muestra detalle.
   - `footer`: utilidades (año + “to top”).
3. `favoritesStore` persiste en `localStorage`:
   - Clave `favoritos` → `["id-uno","id-dos"]`
   - Clave `favoritos_detalle` → `{ "id-uno": { "title":"...", "image":"..." } }`
4. Se emiten eventos por el **bus** para desacoplar componentes.

### Eventos del bus
- `recipe:open`  
  `detail: { key, meta?: { title?: string, image?: string } }`
- `favorites:change`  
  `detail: { count: number }`

---

## Formato de `recetas.json`

```json
[
  {
    "id": "pollo-al-limon",
    "title": "Pollo al Limón",
    "image": "assets/images/Lemon-Chicken-Web-1.jpg",
    "ingredientes": [
      "2 pechugas de pollo",
      "1 limón (jugo y ralladura)"
    ],
    "pasos": [
      "Marinar 30 minutos.",
      "Dorar ambos lados."
    ]
  }
]
```

**Recomendaciones**
- `id` en **slug** (minúsculas, sin espacios).
- `title` igual al de la tarjeta (para fallback por nombre).
- `image` relativa a `index.html`.

---

## Cómo agregar recetas nuevas

1. Sube la imagen a `assets/images/`.
2. Añade un objeto al array en `assets/data/recetas.json` (respeta el formato).
3. Si ya existe una tarjeta en el HTML con ese nombre, el modal la encontrará.  
   Si agregas más tarjetas, replica el patrón de `.recipe-card`.

---

## Favoritos

- Persisten en `localStorage`.
- Claves usadas:
  - `favoritos` (array de keys/ids)
  - `favoritos_detalle` (mapa con `title` e `image` para el dropdown)
- Para “limpiar”: DevTools → Application → Local Storage → borra ambas claves.

---

## Accesibilidad y UX

- Cierre del modal con **Esc** o click fuera.
- Botones de favorito usan `aria-pressed`.
- Imagen del modal con `alt`.
- Puedes añadir un `<label class="sr-only">` para el buscador si quieres mayor A11y.

---

## Personalización rápida

- Colores y sombras: ajustar en `base.css`, `header.css`, `footer.css`.
- Columnas del grid: `cards.css` controla el tamaño de tarjetas y gaps.
- Encabezado/hero: `banner.css`.
- Dropdown de favoritos: `favorites.css`.

---

## Troubleshooting

**No abre el modal / no funciona favoritos**
- `app.js` debe estar **al final del `<body>`** y con `type="module"`.
- Sirviendo por `http://` (no `file://`).
- Revisa DevTools → **Console/Network**:
  - `assets/js/app.js` y módulos 200 OK.
  - `assets/data/recetas.json` 200 OK.

**El contador de favoritos no sube**
- Verifica que el enlace “Mis Favoritos” existe en el header (el módulo lo busca por texto).
- Chequea `localStorage` y el evento `favorites:change` en la consola.

**404 en imágenes**
- Rutas relativas a `index.html` (p. ej. `assets/images/...`).

---

## Roadmap (ideas)

- Filtro por texto en vivo y por categoría (actualizar `cards.js`).
- Página dedicada “/favoritos” (render de cards desde el store).
- Paginación/virtualización si crece el catálogo.
- i18n básico (strings en un módulo).
- Tests mínimos de utilidades (`utils/strings.js`).

---

## Créditos

- **Grupo 5 – CEUTEC**  
  Diseño y desarrollo de la app como proyecto académico.

---

## Licencia

Uso académico. Si planeas producción, sugerido publicar con **MIT** y revisar assets de imagen/licencias.

---