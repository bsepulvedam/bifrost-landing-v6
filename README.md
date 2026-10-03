# Bifröst — Landing v6

Sitio web de **Bifröst** (producción audiovisual, IA y marketing). Es un sitio
estático multipágina en HTML, CSS y JavaScript puro, sin frameworks ni proceso
de build.

## Estado actual

| Página               | Archivo             | Estado                                                        |
| -------------------- | ------------------- | ------------------------------------------------------------- |
| Inicio               | `index.html`        | ✅ Preloader, header, galería de clientes y footer ilustrado   |
| Producciones + IA    | `producciones.html` | 🟡 Estructura base: solo título (hero), falta contenido        |
| Soluciones           | `soluciones.html`   | 🟡 Estructura base: solo título (hero), falta contenido        |
| Nosotros             | `nosotros.html`     | 🟡 Estructura base: solo título (hero), falta contenido        |
| Contacto             | `contacto.html`     | 🟡 Estructura base: solo título (hero), falta formulario/datos |

### Lo que ya funciona

- **Preloader**: logo con resplandor y línea animada; se oculta a los ~2,6 s
  de cargar la página (con un respaldo por si el evento `load` tarda).
- **Header**: logo + botón `Inicio`, y navegación a Producciones audiovisuales
  + IA, Soluciones, Nosotros y Contacto. `Contacto` queda siempre destacado
  (degradado y resplandor permanentes). La página activa se marca con
  `aria-current="page"`.
- **Galería de clientes** (inicio): carrusel horizontal con
  - flechas anterior/siguiente (se desactivan en los extremos),
  - arrastre con mouse, deslizamiento táctil y flechas del teclado,
  - pausa automática de los videos al moverse.
- **Footer** con la ilustración de Bifröst.
- **Responsive**: ajustes para pantallas de ≤ 720 px y ≤ 470 px, y soporte
  para `prefers-reduced-motion`.

### Pendiente

- [ ] Agregar el video `assets/clientes/cliente-01.mp4` (hoy solo existe el
      póster `cliente-01.jpg`; el MP4 debe copiarse a mano).
- [ ] Reemplazar las imágenes temporales `cliente-02` a `cliente-05` por los
      materiales reales de clientes (y actualizar sus textos `alt`).
- [ ] Contenido de las páginas Producciones, Soluciones y Nosotros.
- [ ] Página de Contacto: formulario y/o datos de contacto.
- [ ] Publicar el sitio (por ejemplo, con GitHub Pages).

## Estructura

```text
bifrost-landing-v6/
├── index.html           Inicio: galería de clientes
├── producciones.html    Producciones audiovisuales + IA
├── soluciones.html      Soluciones
├── nosotros.html        Nosotros
├── contacto.html        Contacto
├── styles.css           Estilos de todo el sitio (variables en :root)
├── script.js            Preloader y carrusel de clientes
└── assets/
    ├── bifrost-logo.png
    ├── bifrost-footer.png
    └── clientes/        Imágenes (y video) de la galería
```

## Cómo probar

1. Abre la carpeta en Visual Studio Code.
2. Ejecuta `index.html` con la extensión **Live Server**
   (o abre el archivo directamente en el navegador).

## Historial

- **v6** — Base multipágina creada desde la v5: botón `Inicio` junto al logo,
  nueva navegación, `Contacto` siempre iluminado y título `Clientes` reducido
  un 40 %. Se eliminaron `servicios.html` y `portafolio.html`.
