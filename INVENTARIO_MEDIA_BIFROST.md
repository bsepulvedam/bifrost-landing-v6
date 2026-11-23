# Inventario multimedia de Bifrost V1

Revisión del 23 de noviembre de 2026. Se inspeccionaron nombres, tipos y tamaños de archivos visuales de forma recursiva. Las imágenes públicas se verificaron con lectura de dimensiones y SHA-256. Para las capturas internas se consultaron únicamente el directorio, el tipo, la cantidad y el tamaño agregado. Los tamaños están en kB decimales (1000 bytes).

## Recursos públicos y referencia faltante

| Nombre | Ruta actual | Formato | kB | Dimensiones | Duración y códec | Uso | Estado editorial | Recomendación |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| bifrost-logo.png | `assets/bifrost-logo.png` | PNG | 162,25 | 519 × 457 | — | Cabecera de las cinco páginas y resplandor de primera visita | Marca utilizada. Aprobación de la versión del archivo pendiente de confirmar. | Exportar variantes pequeñas con transparencia. Comparar PNG optimizado, WebP y vector si existe un original apto. |
| bifrost-footer.png | `assets/bifrost-footer.png` | PNG | 127,52 | 2048 × 392 | — | Pie decorativo de las cinco páginas | Marca utilizada. Aprobación de la versión del archivo pendiente de confirmar. | Conservar la relación y la transparencia. Comparar variantes por ancho y carga diferida cuando el pie quede fuera del primer viewport. |
| cliente-01.jpg | `assets/clientes/cliente-01.jpg` | JPEG | 33,50 | 1400 × 900 | — | Póster de la primera tarjeta de Inicio | Utilizado. Aprobación y encuadre definitivos pendientes. | Exportar un fotograma aprobado. Ajustar el recorte 4:3 y comprobar nitidez y peso del póster que se sirve en el primer viewport. |
| cliente-02.jpg | `assets/clientes/cliente-02.jpg` | JPEG | 33,46 | 1400 × 900 | — | Segunda tarjeta de Inicio, 16:10 | Temporal. Autorización pendiente. | Sustituir por una pieza final. Verificar el recorte y el texto alternativo editorial. |
| cliente-03.jpg | `assets/clientes/cliente-03.jpg` | JPEG | 33,55 | 1400 × 900 | — | Tercera tarjeta de Inicio, 4:3 | Temporal. Autorización pendiente. | Entregar un encuadre 4:3 con el punto de interés visible y su texto alternativo. |
| cliente-04.jpg | `assets/clientes/cliente-04.jpg` | JPEG | 33,27 | 1400 × 900 | — | Cuarta tarjeta de Inicio, 16:10 | Temporal. Autorización pendiente. | Evaluar WebP/AVIF con la imagen definitiva y aplicar carga diferida si queda fuera del primer viewport. |
| cliente-05.jpg | `assets/clientes/cliente-05.jpg` | JPEG | 33,51 | 1400 × 900 | — | Quinta tarjeta de Inicio, 4:3 | Temporal. Autorización pendiente. | Evaluar WebP/AVIF con la imagen definitiva. Revisar el recorte 4:3 y el texto alternativo. |
| cliente-01.mp4 | `assets/clientes/cliente-01.mp4` | MP4 esperado por la ruta | — | — | Desconocidos | Fuente del video de la primera tarjeta de Inicio | **Faltante.** No hay archivo local ni registro de aprobación. | Incorporar una versión autorizada o publicar la tarjeta como imagen sin apuntar a un video inexistente. |

Los siete archivos públicos ocupan **457,06 kB**. Sus hashes son distintos. El logo y el pie se reutilizan por referencia, con una sola copia de cada archivo. La única referencia multimedia local rota detectada es `cliente-01.mp4`. Tampoco se hallaron otros videos públicos ni imágenes públicas sin uso en el árbol actual.

Fuera del ámbito público se detectaron **17 PNG** en `auditoria-crm/capturas/`, con **1,21 MB** en total. Son capturas de auditoría interna sin referencias desde la landing. Quedan fuera del catálogo editorial, del contexto Docker y del directorio servido. Sus dimensiones y posibles duplicados internos quedaron sin verificar al mantener la inspección en metadatos de archivo.

## Organización propuesta

| Ruta futura | Equivalencia o criterio |
| --- | --- |
| `assets/brand/` | `assets/bifrost-logo.png` → `assets/brand/bifrost-logo.png`. `assets/bifrost-footer.png` → `assets/brand/bifrost-footer.png`. |
| `assets/posters/` | `assets/clientes/cliente-01.jpg` → `assets/posters/cliente-01.jpg` si sigue siendo el póster aprobado. |
| `assets/images/` | Fotos corporativas compartidas de equipo, estudio y procesos cuando exista material aprobado. |
| `assets/videos/` | Video breve de portada y otros clips compartidos. Si el MP4 pendiente se aprueba para Inicio, usar `assets/videos/cliente-01.mp4` y actualizar su referencia. |
| `assets/projects/<proyecto>/` | Material de cada caso. Las cuatro fotos temporales de `assets/clientes/` corresponderían a las imágenes de cada caso aprobado, con nombre editorial en lugar de un ID provisional. |

Las equivalencias son una propuesta. Al efectuar una migración, actualizar en el mismo cambio los HTML, la lista de `COPY`, `.dockerignore` y las verificaciones. Mantener originales de producción y evidencia de licencias fuera del directorio público.

## Decisiones por página

| Página | Disponible y estado | Material por decidir |
| --- | --- | --- |
| Inicio | Marca en uso, póster pendiente de aprobación, cuatro fotos temporales y MP4 faltante. | Una pieza de apertura aprobada, selección de colaboraciones y permiso de los clientes para publicar. |
| Producciones | Solo elementos comunes de marca. | Casos audiovisuales con imagen de portada y video bajo demanda, subtítulos si hay audio informativo y créditos. |
| Soluciones | Solo elementos comunes de marca. | Imágenes de apoyo de servicios o procesos cuando ayuden a entender la oferta. |
| Nosotros | Solo elementos comunes de marca. | Retratos o fotos de equipo/estudio con permisos confirmados, si se adoptan. |
| Contacto | Solo elementos comunes de marca. | Priorizar datos accionables. Usar una imagen únicamente si aporta contexto. |

Para cada pieza que pase a definitiva, registrar proyecto, fuente, titular, autorización de publicación, páginas permitidas, fecha y versión de exportación. Las imágenes actualmente en uso no acreditan por sí mismas permiso de publicación de terceros.

## Estrategia de entrega

- **Imágenes.** Comparar calidad visual y tamaño de AVIF y WebP con la fuente aprobada. Usar `<picture>` con respaldo cuando sea útil. Definir `srcset` y `sizes` según anchos de tarjeta y densidad efectiva. Añadir dimensiones intrínsecas y reservar espacio. Aplicar `loading="lazy"` a imágenes fuera del primer viewport. Medir antes de priorizar o precargar la imagen principal. [Guía de rendimiento de imágenes](https://web.dev/learn/performance/image-performance).
- **Pósters y portada.** Exportar un póster por clip, probar el encuadre móvil y mantenerlo disponible antes de iniciar el video. Si se conserva un clip breve como portada, priorizar reproducción voluntaria y evitar descargar el video completo antes de la interacción. Considerar movimiento reducido, pausa y visibilidad.
- **Videos.** Usar MP4 H.264 como opción base, con moov al inicio para reproducción progresiva y soporte HTTP de rangos. Para casos largos, ofrecer más calidad bajo demanda a partir de un póster. Verificar códec, resolución, tasa efectiva, audio, color, duración y `206 Partial Content` con los archivos reales. Revisar subtítulos y alternativas según el contenido. [WHATWG, multimedia](https://html.spec.whatwg.org/dev/media.html). [Nginx, rangos HTTP](https://nginx.org/en/docs/http/ngx_http_core_module.html#max_ranges).
- **Distribución.** Servir primero desde el origen. Considerar CDN si bytes transferidos, latencia o distribución geográfica lo justifican. Revisar régimen de solicitudes Range, purga, cache y CSP antes de habilitarlo.
