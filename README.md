# Bifröst

Bifröst es el sitio web de una productora audiovisual que trabaja también con inteligencia artificial y marketing. Este repositorio contiene la versión 6 de la landing: un sitio estático, oscuro y sobrio, donde el protagonista es el material de los clientes y no la interfaz.

La web busca transmitir cuidado y oficio. Fondo negro, tipografía grande, pocos elementos en pantalla y un movimiento que acompaña sin llamar la atención. La identidad gráfica (el logo, el degradado de colores y el footer ilustrado) es lo único que aporta color.

## El sitio

El sitio tiene seis páginas HTML independientes, conectadas mediante enlaces normales.

| Página | Archivo | Contenido actual |
| --- | --- | --- |
| Inicio | `index.html` | Carrusel de pósteres y logos con enlaces a Clientes |
| Producciones audiovisuales + IA | `producciones.html` | Solo el título de la sección |
| Soluciones | `soluciones.html` | Solo el título de la sección |
| Nosotros | `nosotros.html` | Solo el título de la sección |
| Clientes | `clientes.html` | Cinco secciones con reproductores bajo demanda |
| Contacto | `contacto.html` | Solo el título de la sección |

Todas comparten el mismo encabezado. El logo enlaza a Inicio. Debajo del carrusel, Inicio queda junto al enlace a Producciones Audiovisuales+IA. `Contacto` está resaltado con el degradado de la marca y la página actual se marca con `aria-current="page"`.

## Diseño e interacción

La interfaz es oscura y mantiene una jerarquía simple: un título grande por página, navegación en forma de píldoras y, en Inicio, una fila de tarjetas con pósteres y logos. Los colores, el logo y la composición son de Bifröst. El sistema de movimiento toma como referencia el comportamiento de las interfaces de escritorio modernas (cambios pequeños, respuesta inmediata, curvas suaves), pero sin cambiar la identidad del sitio.

El movimiento se usa con moderación a propósito. Un enlace responde al pasar el cursor, un botón se hunde un poco al pulsarlo, una card sube apenas de escala y el logo de la cabecera recibe un breve resplandor en la primera visita de la sesión.

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

Los tiempos y las curvas viven en un pequeño conjunto de variables al inicio de `styles.css`.

| Variable | Valor | Uso |
| --- | --- | --- |
| `--motion-fast` | 160 ms | Pulsación de botones |
| `--motion-normal` | 260 ms | Hover de enlaces, botones y cards |
| `--motion-slow` | 420 ms | Resplandor del logo y relleno de degradado en la navegación |
| `--ease-apple` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva general de las animaciones |

**Tarjetas, botones y navegación.** Al pasar el cursor, el póster se amplía a escala 1.03 dentro de la tarjeta y la capa de contraste se oscurece. Los botones y las píldoras de la navegación tienen estado `:active`. Los enlaces de la navegación suben 2 px en hover y rellenan el fondo con el degradado de la marca desde abajo.

## Carga inicial

El contenido se muestra desde el inicio y los enlaces usan la navegación nativa del navegador. El script compartido se carga con `defer`.

En la primera visita de una sesión, el logo de la cabecera recibe un resplandor de 420 ms. El efecto es decorativo. `sessionStorage` solo guarda si ya se mostró. Cuando el almacenamiento está bloqueado, JavaScript no está disponible o el usuario prefiere reducir el movimiento, el logo se presenta en su estado normal.

## Carrusel

La galería de clientes del inicio no usa ninguna librería. Es un contenedor con `overflow-x: auto` y `scroll-snap`, al que `script.js` añade lo siguiente:

- Botones anterior y siguiente. Aparecen cuando el script está operativo y hay tarjetas fuera de vista. Al alcanzar un extremo, el botón correspondiente indica que está deshabilitado y conserva el foco.
- Arrastre con el mouse mediante pointer events. Con el tacto se usa el desplazamiento nativo del navegador.
- Flechas izquierda y derecha del teclado cuando el contenedor o una tarjeta tiene el foco.

Cada tarjeta enlaza a la sección de su marca en `clientes.html`. Los reproductores usan `preload="none"` y necesitan los cinco MP4 optimizados en `assets/clientes/videos/`, excluidos de Git. Para Docker, consultar el montaje documentado en la guía de despliegue.

## Accesibilidad

Cuando el sistema operativo pide reducir el movimiento (`prefers-reduced-motion: reduce`):

- El logo se muestra sin el resplandor de entrada.
- Se desactiva el efecto de escala en cards y los desplazamientos en hover.
- No hay smooth scrolling, ni en CSS ni en los botones y flechas del carrusel.

El primer Tab ofrece un salto al contenido principal. Los enlaces, los botones y el carrusel tienen un indicador de foco. Si JavaScript no está disponible, el carrusel conserva el desplazamiento nativo. Los efectos hover están dentro de `@media (hover: hover)`, así que en pantallas táctiles no se quedan pegados tras tocar.

## Tecnologías

HTML5, CSS3 y JavaScript sin dependencias ni paso de build.

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
├── clientes.html
├── contacto.html
├── styles.css             Estilos de todo el sitio
├── script.js              Resplandor del logo y carrusel
├── README.md
└── .gitignore
```

## Ejecutar el proyecto

No hace falta instalar nada ni compilar.

```bash
git clone https://github.com/bsepulvedam/bifrost-landing-v6.git
cd bifrost-landing-v6
```

El sitio se puede abrir desde `index.html`. Un servidor local permite probar la navegación, el video y el almacenamiento de sesión bajo el mismo origen HTTP. Puedes usar Live Server en Visual Studio Code o ejecutar este comando desde la carpeta del proyecto.

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`. Para volver a ver el resplandor después de la primera visita, abre el sitio en una pestaña nueva.

## Cómo trabajar con el proyecto

El contenido y la estructura están en los HTML. El encabezado y el footer se repiten en las seis páginas, así que un cambio en la navegación hay que hacerlo en cada archivo. Los estilos están en `styles.css`. El resplandor del logo, el carrusel y los avisos de reproducción se inicializan en `script.js`. Los medios se guardan en `assets/`.

Antes de tocar una animación, conviene reutilizar las variables de motion en lugar de escribir tiempos nuevos. Si un hover necesita una duración, que use `--motion-normal` y `--ease-apple`, no algo como `transition: 327ms ease`. Con el tiempo, valores sueltos hacen que cada componente se mueva distinto, y justo eso es lo que el sistema evita.

Las cards del carrusel no deben animarse con `animation ... forwards` porque dejaría el `transform` fijado y anularía el hover.

## Responsive

El diseño usa `clamp()` para tamaños y márgenes, y dos puntos de corte en 720 px y 470 px. Hasta 720 px se compactan el encabezado y la navegación, y las tarjetas usan el 80 % del ancho de la ventana con un máximo de 420 px. Hasta 470 px el encabezado se apila y la navegación se reparte en dos filas.

La guía de [despliegue](DEPLOY_BIFROST.md) documenta Coolify, el contenedor y la CI. El [inventario multimedia](INVENTARIO_MEDIA_BIFROST.md) registra los archivos y decisiones editoriales pendientes.

## Estado actual

La versión actual mantiene la estructura original de Bifröst y concentra los últimos cambios en la experiencia de interacción. La tipografía, las transiciones y las microinteracciones comparten ahora un mismo lenguaje de movimiento, sin cambiar la composición general del sitio.

Las páginas de Producciones, Soluciones, Nosotros y Contacto aún esperan contenido. Los cinco reproductores de Clientes se pueden probar localmente con las copias optimizadas.

El proyecto sigue siendo deliberadamente pequeño: HTML, CSS y JavaScript nativo. Si su complejidad crece, se podrá reevaluar esa decisión, pero hoy no hay una necesidad técnica de introducir un framework.
