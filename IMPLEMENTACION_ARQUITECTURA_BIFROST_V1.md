# Implementación de la arquitectura Bifröst V1

La tarea 05 se implementó sobre `develop` en `ef8bedc`, en la rama `feature/arquitectura-bifrost-v1`. El sitio sigue siendo HTML, CSS y JavaScript nativos. Las 28 páginas se pueden revisar localmente. El artefacto de Nginx sirve 16 páginas, con una lista explícita de archivos y una etapa de preparación que elimina los índices y enlaces editoriales de revisión.

## Páginas y cápsulas

| Área | Rutas | Cápsulas |
| --- | --- | --- |
| Global | Las 28 páginas | `GLB-HEAD`, `GLB-FOOT`, `GLB-CRUMB` en páginas internas y `GLB-CTA` en Inicio, hubs y subpáginas de servicio y Soluciones |
| Inicio | `index.html` | `INI-01` a `INI-05` |
| Producción | `producciones.html` y `producciones/{videos-corporativos,comerciales-y-campanas,contenido-para-redes-sociales,videos-con-ia,postproduccion-vfx,cobertura-de-eventos}.html` | `PRD-01` y `PRD-02`, `SVC-01` a `SVC-05` en cada servicio |
| Soluciones | `soluciones.html` y `soluciones/{marcas-y-empresas,agencias-y-productoras,instituciones-publicas,restaurantes-bares-y-comercio}.html` | `SOL-01` y `SOL-02`, `SLT-01` a `SLT-03`, `SLT-05` y `SLT-06` donde hay proyectos de revisión local |
| Clientes | `clientes.html` | `CLI-01` a `CLI-04`. Se mantienen las cinco anclas y reproductores |
| Fichas locales | `clientes/{caja-los-andes,innmersive-t,amarock-producciones,lola-bar,philipai,dai-heladeria,juntos,chucao-films,sfsg,alaska-films,brutal-films,bendita-escena}.html` | `FCH-01` a `FCH-07`, con omisión de filas o secciones vacías |
| Nosotros | `nosotros.html` | `NOS-01` a `NOS-06` |
| Contacto | `contacto.html` | `CON-01` a `CON-03` |

Se reutilizaron el logo, la ilustración de cierre, las variables y tipografías del sistema, el desplazamiento nativo del carrusel, sus imágenes y la carga de los reproductores bajo demanda. El rediseño añade un hero tipográfico, submenús de escritorio, rutas de navegación, tarjetas y botones compartidos, FAQ nativas y un footer corporativo. Los 28 HTML mantienen el contenido editable y etiquetan las cápsulas y tarjetas con `data-capsule` y `data-item`.

Además de los HTML, cambiaron `styles.css`, `script.js`, `robots.txt`, `Dockerfile`, `.dockerignore`, `.github/workflows/frontend.yml`, `scripts/validate-frontend.mjs`, `README.md` y `DEPLOY_BIFROST.md`. La configuración de Nginx y su CSP se reutilizan.

## Discrepancias resueltas

- La tarea 05 prevalece sobre el título y antetítulo propuestos para el carrusel. La sección se llama **Clientes**. El hero usa **Productora audiovisual e IA en Santiago** y los cinco destacados conservan sus enlaces.
- Las doce fichas existen para revisión y llevan `noindex, nofollow`. El Dockerfile excluye sus rutas y elimina los bloques locales de índices y enlaces de las 16 páginas públicas. Los servicios conservan un enlace público al portafolio. La relación de Bifröst con marcas en los cinco destacados sigue sujeta a revisión.
- Se omitieron las afirmaciones de habilitación en Mercado Público y Compra Ágil en el footer, Inicio, la página de instituciones y sus metadatos y Nosotros. La cápsula `SLT-04` queda pendiente. Se mantuvo la mención biográfica a las postulaciones como parte de las tareas de Enzo y se preservaron las atribuciones a agencias o productoras en las fichas.
- El botón de Producción usa la etiqueta larga en escritorio y abre el hub desde la variante compacta en móvil. Las rutas conservan el sufijo `.html`. Los submenús y rutas de navegación funcionan con marcado nativo y CSS.
- Open Graph incluye los datos que se conocen. `ProfessionalService` y las FAQ usan JSON-LD sin correo, dominio o URL ficticios. Canonical, `og:url`, `og:image`, `BreadcrumbList` y sitemap dependen del dominio definitivo.

## Validación

Las fases se registraron en commits locales descriptivos. `node --check script.js`, `node scripts/validate-frontend.mjs` y `git diff --check` verifican sintaxis, 28 rutas de desarrollo, 16 rutas públicas, referencias relativas, navegación, fragmentos, SEO básico y protección de rutas privadas. El workflow comprueba además la imagen real con Nginx y espera 404 para los MP4 sin volumen y las fichas fuera de publicación.

El repositorio mantiene los cinco MP4 fuera de Git y Docker. El runner de GitHub Actions ejecuta la prueba Docker cuando se publica la rama. El daemon de Docker no estaba disponible en el equipo local.

En Chrome 157 se revisaron las 28 rutas a 320, 390, 768, 1024 y 1366 px, sin desbordamiento horizontal. Se probaron los submenús con hover, Tab y Escape, el salto al contenido, el foco visible, las FAQ y los enlaces del carrusel. El carrusel avanzó y volvió al inicio. Se verificaron las pausas por hover, foco, elección del usuario, movimiento reducido y salida del área visible, además de la lógica de pestaña oculta mediante un evento de visibilidad simulado. Se probaron arrastre, gesto táctil y disponibilidad de enlaces con JavaScript deshabilitado. Se corrigió el arrastre nativo de los enlaces, que podía interrumpir el desplazamiento del carrusel.

Inicio y Clientes hicieron cero solicitudes de MP4 durante la navegación inicial. Los cinco videos reprodujeron localmente y cada activación solicitó solo el archivo elegido. La regla de limpieza de Docker se comprobó también con `sed` sobre las 16 páginas de la lista. El contraste calculado fue 7,26:1 para el texto atenuado sobre negro y 14,64:1 para el acento cian sobre la superficie.

### Rendimiento de laboratorio

En tres cargas de Inicio a 390 × 844 px, con caché deshabilitada, CPU 4× más lenta, 150 ms de latencia y 1,6 Mb/s de descarga, los LCP fueron 976, 936 y 944 ms. La mediana fue **944 ms**, con el H1 como elemento principal. El CLS fue **0** en las tres cargas. Quedan por medir INP y los indicadores de campo en producción. Firefox, Safari y lectores de pantalla también quedan pendientes de prueba.

## Revisar localmente

1. Abrir el checkout de `feature/arquitectura-bifrost-v1` en un servidor estático ligado a loopback, por ejemplo `python -m http.server 8000 --bind 127.0.0.1` o Live Server con host `127.0.0.1`.
2. Abrir Inicio y navegar a los hubs y sus subpáginas. En Clientes quedan disponibles las fichas de revisión. Los cinco archivos optimizados deben estar en `assets/clientes/videos/` para probar la reproducción.
3. Ejecutar `node scripts/validate-frontend.mjs`. Los argumentos `--public-routes` y `--draft-routes` imprimen las listas que comprueba el workflow.

## Pendientes de producción

Revisar las doce fichas y aprobar sus materiales. Confirmar el correo comercial, los permisos de uso audiovisual, el RUT, las credenciales comerciales, la formación de Simo, los perfiles de Enzo y Simo, los tres retratos, el rubro de Juntos y el tema de las cápsulas de Amarock. La página de Contacto ofrece los canales confirmados y omite el formulario y horario.

Configurar el dominio, los datos sociales dependientes de él, el sitemap y los subtítulos para las piezas con audio informativo. Confirmar el montaje persistente de los MP4, mantener permisos de lectura adecuados y probar solicitudes HTTP 206. La rama de trabajo es para revisión y la integración a `develop` requiere una decisión posterior.

## GitHub

[Comparar la rama de trabajo con develop](https://github.com/bsepulvedam/bifrost-landing-v6/compare/develop...feature/arquitectura-bifrost-v1)
