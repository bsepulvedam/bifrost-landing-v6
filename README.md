# Bifröst

Bifröst es el sitio web de una productora audiovisual que trabaja también con inteligencia artificial y marketing. Este repositorio contiene la versión 6 de la landing: un sitio estático, oscuro y sobrio, donde el protagonista es el material de los clientes y no la interfaz.

La web busca transmitir cuidado y oficio. Fondo negro, tipografía grande, pocos elementos en pantalla y un movimiento que acompaña sin llamar la atención. La identidad gráfica (el logo, el degradado de colores y el footer ilustrado) es lo único que aporta color.

## El sitio

El sitio tiene cinco páginas HTML independientes. La navegación es multipágina, con enlaces normales entre archivos. No es una SPA y por ahora no hay motivo para que lo sea.

| Página | Archivo | Contenido actual |
| --- | --- | --- |
| Inicio (Clientes) | `index.html` | Galería de clientes con carrusel y footer ilustrado |
| Producciones audiovisuales + IA | `producciones.html` | Solo el título de la sección |
| Soluciones | `soluciones.html` | Solo el título de la sección |
| Nosotros | `nosotros.html` | Solo el título de la sección |
| Contacto | `contacto.html` | Solo el título de la sección |

Todas comparten el mismo encabezado: el logo, un botón `Inicio` y la navegación principal. `Contacto` está siempre resaltado con el degradado de la marca, y la página en la que estás se marca con `aria-current="page"`. Las cuatro páginas internas son por ahora una estructura base que espera su contenido.

## Diseño e interacción

La interfaz es oscura y mantiene una jerarquía simple: un título grande por página, navegación en forma de píldoras y, en el inicio, una fila de cards con imágenes y video. Los colores, el logo y la composición son de Bifröst. El sistema de movimiento toma como referencia el comportamiento de las interfaces de escritorio modernas (cambios pequeños, respuesta inmediata, curvas suaves), pero sin cambiar la identidad del sitio.

El movimiento se usa con moderación a propósito. Un enlace responde al pasar el cursor, un botón se hunde un poco al pulsarlo, una card sube apenas de escala, y las páginas aparecen y desaparecen con un fundido corto. Si una animación no ayuda a entender la interfaz, no está.

## Tipografía

El sitio usa fuentes del sistema, definidas en la variable `--font-ui` de `styles.css`:

```css
-apple-system,
BlinkMacSystemFont,
"SF Pro Display",
"SF Pro Text",
"Segoe UI",
Helvetica,
Arial,
sans-serif
```

El repositorio no incluye ningún archivo de fuente. SF Pro solo se usa si ya está instalada en el equipo de quien visita la página; en macOS e iOS el navegador usa la fuente del sistema, y en Windows normalmente se resuelve a Segoe UI. Por eso los títulos pueden verse algo más anchos o más estrechos según el sistema, y conviene revisar los títulos largos (en especial "Producciones audiovisuales + IA") en ambos.

La jerarquía se resuelve con peso e interletrado más que con tamaños. Los títulos de página y de sección usan peso 600 con interletrado negativo (entre -0.035em y -0.055em, más apretado cuanto más grande el texto), la navegación va en 500 y el resto del texto en 400.

## Motion

Los tiempos y las curvas viven en un pequeño conjunto de variables al inicio de `styles.css`:

| Variable | Valor | Uso |
| --- | --- | --- |
| `--motion-fast` | 160 ms | Pulsación de botones y fade de salida entre páginas |
| `--motion-normal` | 260 ms | Hover de enlaces, botones y cards |
| `--motion-slow` | 420 ms | Entrada de contenido y relleno de degradado en la navegación |
| `--ease-apple` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva general: arranca rápido y frena suave |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Fundidos simples, como el del preloader |

También existen `--reveal-distance` y `--reveal-step`, que controlan cuánto se desplaza y cuánto se escalona la entrada de contenido, y `--preloader-fade`.

**Entrada de página.** Cuando la página está lista, sus bloques principales (encabezado, título, carrusel o lista, texto de ayuda y footer) aparecen con un fundido y un desplazamiento de 10 px hacia arriba, con 60 ms de diferencia entre uno y otro. En móvil el desplazamiento baja a 6 px y la diferencia a 40 ms. Se resuelve con `transition` y no con `animation` a propósito: una animación con `forwards` dejaría el `transform` fijado y pisaría los efectos hover.

**Fade entre páginas.** Al pulsar un enlace interno, `script.js` añade la clase `is-leaving` al `body`, la página se desvanece en 160 ms y entonces navega. Solo intercepta navegación normal. No actúa con Ctrl, Cmd, Shift, Alt ni clic central, ni con `target` distinto de `_self`, `download`, enlaces externos, `mailto:`, `tel:` o enlaces a la misma página. Si el script falla, los enlaces siguen funcionando como siempre. Al volver con el botón "atrás", el handler de `pageshow` quita `is-leaving` por si el navegador restaura la página desde caché.

**Cards, botones y navegación.** Las cards del carrusel suben a escala 1.015 al pasar el cursor, con un borde algo más claro y una sombra suave. El contenedor y la imagen o video se mueven juntos. Los botones y las píldoras de la navegación tienen estado `:active` con escala 0.98 (0.96 en las flechas del carrusel), de modo que se sienten pulsados. Los enlaces de la navegación suben 2 px en hover y rellenan el fondo con el degradado de la marca desde abajo.

## Preloader

La primera vez que se abre el sitio en una pestaña se muestra el preloader: el logo aparece con un resplandor y una línea de progreso, y se retira a los 2,6 segundos de terminar la carga (hay un respaldo por si el evento `load` tarda). Al retirarse, el fundido de salida y la entrada del contenido ocurren a la vez, para que no haya una pantalla vacía en medio.

Al terminar, `script.js` guarda `bifrost:seen` en `sessionStorage`. Mientras la sesión de esa pestaña siga abierta, las demás páginas no vuelven a mostrar el preloader, porque con un fade de navegación de 160 ms una espera de varios segundos en cada clic no tendría sentido. Esto también significa que recargar el inicio en la misma pestaña no lo repite. Cerrar la pestaña lo reinicia.

La decisión se toma en dos sitios. El script inline del `<head>` de cada HTML comprueba el valor y añade la clase `skip-preloader` a `<html>` antes del primer pintado, y `script.js` lo guarda en `finishPreloader()`. Para volver a mostrarlo en cada página basta con quitar ese script del `<head>` y la línea de `sessionStorage` en `finishPreloader()`.

Ese mismo script añade la clase `js` a `<html>`. Los bloques que esperan el reveal y el preloader solo se activan con ella, así que sin JavaScript el sitio se ve completo desde el principio.

## Carrusel

La galería de clientes del inicio no usa ninguna librería. Es un contenedor con `overflow-x: auto` y `scroll-snap`, al que `script.js` añade lo siguiente:

- Botones anterior y siguiente, que se desactivan en los extremos. Se ocultan en pantallas de 470 px o menos.
- Arrastre con el mouse mediante pointer events. Con el tacto se usa el desplazamiento nativo del navegador.
- Flechas izquierda y derecha del teclado cuando el carrusel tiene el foco.
- Pausa de todos los videos al moverse por el carrusel, ya sea con botones, teclado o arrastre.

El primer elemento es un video con su póster, y el resto son imágenes. Durante el arrastre se desactiva el snap y se recupera al soltar. El video `assets/clientes/cliente-01.mp4` no está en el repositorio: hay que copiarlo a mano, y mientras tanto se ve el póster `cliente-01.jpg`.

## Accesibilidad

Cuando el sistema operativo pide reducir el movimiento (`prefers-reduced-motion: reduce`):

- Los bloques aparecen ya visibles, sin desplazamiento ni retardo.
- Se desactiva el efecto de escala en cards y los desplazamientos en hover.
- No hay smooth scrolling, ni en CSS ni en los botones y flechas del carrusel.
- No se aplica el fade de navegación: los enlaces navegan directamente.
- El preloader se retira en cuanto termina la carga, sin esperar los 2,6 segundos.

Los cambios de estado (hover, foco, deshabilitado) siguen siendo visibles, solo que sin transición. La navegación por teclado funciona con Tab y Enter, los enlaces, botones y el carrusel muestran un contorno blanco con `:focus-visible`, y el carrusel responde a las flechas. Los efectos hover están dentro de `@media (hover: hover)`, así que en pantallas táctiles no se quedan pegados tras tocar.

## Tecnologías

HTML5, CSS3 y JavaScript sin dependencias. No hay React, Vue, Angular, jQuery, GSAP, Bootstrap ni Tailwind, tampoco `package.json` ni paso de build. Con cinco páginas, un carrusel y un conjunto de transiciones, un framework añadiría más peso del que resuelve, y así cualquiera puede abrir un archivo y editarlo.

## Estructura del proyecto

```text
bifrost-landing-v6/
├── assets/
│   ├── bifrost-logo.png
│   ├── bifrost-footer.png
│   └── clientes/          Imágenes y video de la galería
├── index.html
├── producciones.html
├── soluciones.html
├── nosotros.html
├── contacto.html
├── styles.css             Estilos de todo el sitio
├── script.js              Preloader, fade entre páginas y carrusel
├── README.md
└── .gitignore
```

## Ejecutar el proyecto

No hace falta instalar nada ni compilar.

```bash
git clone https://github.com/bsepulvedam/bifrost-landing-v6.git
cd bifrost-landing-v6
```

Después se puede abrir `index.html` directamente en el navegador, y todo funciona, incluido el fade entre páginas. Aun así es preferible usar un servidor local para que los videos y la navegación se comporten como en producción. En Visual Studio Code sirve la extensión Live Server, o desde la carpeta:

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000`. Para volver a ver el preloader después de la primera carga, abre el sitio en una pestaña nueva.

## Cómo trabajar con el proyecto

El contenido y la estructura están en los HTML. El encabezado y el footer se repiten en las cinco páginas, así que un cambio en la navegación hay que hacerlo en cada archivo. Los estilos están todos en `styles.css`, organizados por secciones con comentarios. El preloader, el fade entre páginas y el carrusel están en `script.js`. Las imágenes y el video van en `assets/`.

Antes de tocar una animación, conviene reutilizar las variables de motion en lugar de escribir tiempos nuevos. Si un hover necesita una duración, que use `--motion-normal` y `--ease-apple`, no algo como `transition: 327ms ease`. Con el tiempo, valores sueltos hacen que cada componente se mueva distinto, y justo eso es lo que el sistema evita.

Dos cosas que es fácil romper. Los bloques con reveal están listados en `styles.css`, en la regla que usa `:is(...)`; si se añade un bloque nuevo que deba entrar así, hay que agregarlo en esa lista y en la de `prefers-reduced-motion`. Y las cards del carrusel no deben animarse con `animation ... forwards`, porque dejaría el `transform` fijo y anularía el hover.

## Responsive

El diseño usa `clamp()` para tamaños y márgenes, y dos puntos de corte: 720 px y 470 px. Por debajo de 720 px se compactan el encabezado y la navegación, las cards del carrusel pasan a ocupar el 82 % del ancho y el reveal se acorta. Por debajo de 470 px el encabezado se apila, la navegación pasa a dos columnas y los botones del carrusel se ocultan, porque ahí se desliza con el dedo.

El carrusel tiene 8 px de relleno superior, compensados con un margen negativo, para que el escalado de las cards no quede recortado por el `overflow` del contenedor.

## Estado actual

La versión actual mantiene la estructura original de Bifröst y concentra los últimos cambios en la experiencia de interacción. La tipografía, las transiciones y las microinteracciones comparten ahora un mismo lenguaje de movimiento, sin cambiar la composición general del sitio.

Falta contenido. Las páginas de producciones, soluciones, nosotros y contacto solo tienen su título (contacto aún no tiene formulario ni datos), las imágenes de `cliente-02` a `cliente-05` son temporales y falta copiar el video de `cliente-01`. El sitio tampoco está publicado todavía.

El proyecto sigue siendo deliberadamente pequeño: HTML, CSS y JavaScript nativo. Si su complejidad crece, se podrá reevaluar esa decisión, pero hoy no hay una necesidad técnica de introducir un framework.
