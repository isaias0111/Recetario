# Recetas CEUTEC — Buscador de Recetas

Sitio web estático (HTML + CSS + JS) para explorar recetas por categorías, buscar dentro de una categoría y guardar favoritas con **LocalStorage**.

## ✨ Funcionalidades
- Banner/hero con título y descripción.
- Chips de **categorías** (Pollo, Res, Cerdo, Pescado, etc.).
- **Buscador** dentro de la categoría activa.
- **Tarjetas** de receta con imagen, título, botón “Ver receta” y “★ Favorito”.
- Persistencia de **favoritos** en el navegador.
- Diseño **responsive** (móvil/desktop).

## 📁 Estructura de carpetas
```
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   └── data.js        # (opcional) semillas/JSON de recetas
│   └── images/
│       ├── pollo-limon.jpg
│       ├── carne-res.jpg
│       ├── chuleta-cerdo.jpg
│       ├── pescado-horno.jpg
│       ├── mariscos-mixtos.jpg
│       ├── pasta-italiana.jpg
│       ├── ensalada-vegetariana.jpg
│       ├── bowl-vegano.jpg
│       ├── pastel-frutas.jpg
│       ├── sopa-calabaza.jpg
│       ├── ensalada-mixta.jpg
│       └── desayuno-huevo.jpg
└── .gitignore
```

> Las imágenes de categoría se recomiendan a **300×150 px** (formato `.jpg` optimizado).

## 🚀 Cómo ejecutar
- Abre `index.html` directamente en el navegador **o** usa un servidor local:
  - Python: `python -m http.server 8000`
  - VS Code: extensión **Live Server** → “Open with Live Server”.

## 🔧 Configuración rápida
- **Imágenes:** coloca los archivos en `assets/images/` con los nombres sugeridos (300×150 px).
- **Datos:** si usas `data.js`, exporta un arreglo de recetas. Ejemplo:
  ```js
  // assets/js/data.js
  const RECETAS = [
    { id: 1, titulo: 'Pollo al Limón', categoria: 'Pollo', img: 'assets/images/pollo-limon.jpg' },
    // ...
  ];
  ```
- **Favoritos:** `app.js` debe leer/escribir en `localStorage.setItem('favoritos', JSON.stringify(...))`.

## 🖼️ Recursos de diseño
- Wireframes (desktop/móvil) y logo simple sin texto fueron considerados en la maqueta.
- Paleta sugerida del banner: **de coral a naranja** (gradiente lineal).

## 🧰 Buenas prácticas
- **Accesibilidad:** usa `alt` en imágenes, contrastes adecuados y `aria-pressed` en el botón de favoritos.
- **SEO básico:** añade `<title>`, `meta description` y `og:image`.
- **Rendimiento:** comprime imágenes (TinyPNG/Imagemin), usa `loading="lazy"` y `width/height` fijos.

## 📦 Despliegue
- **GitHub Pages:** sube al branch `main` → *Settings* → *Pages* → *Deploy from a branch* → `root`.
- **Netlify/Vercel:** importa el repo y selecciona proyecto estático (sin build).

## ✅ Checklist previo a producción
- [ ] Favicons (`/favicon.ico`, `site.webmanifest`).
- [ ] Robots y sitemap si aplica.
- [ ] Validación HTML/CSS (W3C).
- [ ] Pruebas en móvil (Chrome/Android, Safari/iOS).

## 📜 Licencias & Créditos
- Fotos libres de uso (Unsplash/Pexels). Verifica licencias en cada recurso si cambian.
- Código del proyecto: MIT (o la licencia que definas).

## 💡 Roadmap (opcional)
- [ ] Paginación/infinite scroll.
- [ ] Vista de detalle de receta.
- [ ] Filtrado combinado (tiempo, dificultad, precio).
- [ ] Exportar favoritos (JSON).
