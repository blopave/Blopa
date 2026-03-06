# blo pa/ — Portfolio

Sitio web personal de Pablo Vela — Creative Developer.
Diseño web y música electrónica desde Buenos Aires.

**Versión:** 1.0
**Fecha:** Marzo 2026

## Cómo correr

**Opción 1 — Servidor local (recomendado)**
```bash
python3 -m http.server 8000
# o: npx serve .
# o: VS Code Live Server extension
```

**Opción 2 — Apertura directa**
Abrir `index.html` en el navegador. Las fonts requieren conexión a internet (Google Fonts).

## Estructura del proyecto

```
Blopa/
├── index.html          ← HTML semántico, one-page con 4 secciones
├── README.md           ← Este archivo
├── manifest.json       ← PWA manifest
├── robots.txt          ← Directivas de indexación
├── sitemap.xml         ← Sitemap para SEO
├── css/
│   └── styles.css      ← Estilos organizados por sección
├── js/
│   └── main.js         ← Interactividad: canvas, cursor, navegación
└── assets/
    ├── img/            ← Imágenes, favicons, OG image
    └── fonts/          ← Fonts locales (si aplica)
```

## Stack técnico

- HTML5 semántico
- CSS3 (custom properties, clamp, clip-path, grid, scroll-snap)
- Vanilla JavaScript (ES6+, Canvas API)
- Google Fonts: Inter, Bebas Neue
- Zero dependencias externas

## Características

### Diseño
- Estética dark monocromática con accent cyan (#22d3ee)
- Sistema tipográfico: Inter (body), Bebas Neue (display), Courier New (mono)
- Film grain animado con SVG feTurbulence
- Vignette radial sobre scroll container

### Animaciones y micro-interacciones
- Dot grid canvas interactivo con detección de proximidad del cursor
- Custom cursor con dot + ring (transform3d para performance)
- Preloader con skip por sessionStorage en visitas repetidas
- Reveals con clip-path escalonados por sección
- Per-letter stagger en títulos de sección
- Scan line + glitch en logo (Canvas API)
- Active Marker en hover de proyectos
- Efecto magnético en CTA de Soundcloud
- Waveform animado en sección Music
- Marquees de géneros musicales
- Expand inline de proyectos con grid-template-rows
- Email split hover (usuario / @ / dominio)

### Secciones
1. **Home** — Hero con taglines gigantes, logo animado, marquee, identity tagline
2. **Web Design** — Lista de 5 proyectos expandibles con imagen, descripción y stack
3. **Music** — Stats, CTA a Soundcloud, waveform, marquees de géneros
4. **Contacto** — Email, disponibilidad, manifiesto, links, botón de retorno

## Tipografías

| Font | Peso | Uso |
|------|------|-----|
| Inter | 300, 400, 500, 700 | Body, navegación, descripciones |
| Bebas Neue | 400 | Títulos, logo, números grandes |
| Courier New | 400 | Labels, metadata, monospace |

## Paleta de colores

| Variable | Hex | Uso |
|----------|-----|-----|
| --white | #ffffff | Texto principal, títulos |
| --off | #c8c8c8 | Texto hover secundario |
| --mid | #888888 | Texto medio, labels |
| --dim | #555555 | Texto terciario, bordes |
| --dim2 | #282828 | Separadores, fondos sutiles |
| --black | #000000 | Fondo principal |
| --accent | #22d3ee | Acentos, links, indicadores |

## Pendientes de integración

- [ ] Imágenes reales de proyectos (reemplazar Unsplash)
- [ ] Imagen OG (1200×630px)
- [ ] Favicons (32px, 192px, 512px, apple-touch-icon)
- [ ] Dominio y URLs definitivas
- [ ] Links reales en "Ver proyecto"

## Despliegue

Sitio estático, compatible con cualquier hosting.
Optimizado para Vercel, Netlify o Cloudflare Pages.

---

Diseño que comunica · Código que vive · Música que mueve
