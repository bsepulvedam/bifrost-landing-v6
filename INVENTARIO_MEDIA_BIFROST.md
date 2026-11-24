# Inventario multimedia de Bifrost V1

Revisión del 23 de noviembre de 2026. Se inspeccionaron nombres, tipos y tamaños de archivos visuales de forma recursiva. Las imágenes públicas se verificaron con lectura de dimensiones y SHA-256. Para las capturas internas se consultaron únicamente el directorio, el tipo, la cantidad y el tamaño agregado. Los tamaños están en kB decimales (1000 bytes).

## Recursos públicos en la revisión inicial

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

Los siete archivos públicos de la revisión inicial ocupaban **457,06 kB**. La tarea 04B reemplazó los JPEG provisionales y la referencia a `cliente-01.mp4` en Inicio por los recursos de la biblioteca de clientes.

Fuera del ámbito público se detectaron **17 PNG** en `auditoria-crm/capturas/`, con **1,21 MB** en total. Son capturas de auditoría interna sin referencias desde la landing. Quedan fuera del catálogo editorial, del contexto Docker y del directorio servido. Sus dimensiones y posibles duplicados internos quedaron sin verificar al mantener la inspección en metadatos de archivo.

## Organización general propuesta

| Ruta futura | Equivalencia o criterio |
| --- | --- |
| `assets/brand/` | `assets/bifrost-logo.png` → `assets/brand/bifrost-logo.png`. `assets/bifrost-footer.png` → `assets/brand/bifrost-footer.png`. |
| `assets/clientes/posters/` | Pósteres WebP por marca usados en Inicio y Clientes. |
| `assets/images/` | Fotos corporativas compartidas de equipo, estudio y procesos cuando exista material aprobado. |
| `assets/clientes/videos/` | Copias web locales de los cinco reproductores de Clientes, excluidas de Git. |
| `assets/projects/<proyecto>/` | Material de cada caso. Las cuatro fotos temporales de `assets/clientes/` corresponderían a las imágenes de cada caso aprobado, con nombre editorial en lugar de un ID provisional. |

Las equivalencias son una propuesta. Al efectuar una migración, actualizar en el mismo cambio los HTML, la lista de `COPY`, `.dockerignore` y las verificaciones. Mantener originales de producción y evidencia de licencias fuera del directorio público.

## Decisiones por página

| Página | Disponible y estado | Material por decidir |
| --- | --- | --- |
| Inicio | Carrusel de los cinco clientes con WebP y SVG. | Aprobación editorial y autorización de los clientes para publicar. |
| Clientes | Cinco reproductores bajo demanda con los MP4 locales. | Almacenamiento de videos en producción y subtítulos para las piezas con audio informativo. |
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

## Biblioteca del carrusel de clientes

Revisión del 24 de noviembre de 2026 en la rama `develop`. Se localizaron cinco logos y cinco videos en `Bifrost_media`. Todas las rutas de origen de este inventario son relativas a esa carpeta. El material original suma **486 669 810 bytes** (486,67 MB decimales), repartidos en 486 418 689 bytes de video y 251 121 bytes de SVG. Los diez archivos tienen hashes distintos y conservaron sus tamaños y SHA-256 iniciales. Los archivos del árbol público `assets/` también tienen hashes distintos entre sí.

### Logos web verificados

Los destinos son relativos a `assets/clientes/` y cada SVG coincide byte a byte con el original. Los cinco son SVG de 2000 × 1000, con relleno blanco y metadatos C2PA en Base64. La revisión XML de las copias descartó DTD, instrucciones de procesamiento, scripts, manejadores de eventos, enlaces externos activos y contenido incrustado ejecutable. Se conservaron los colores, las proporciones y los metadatos.

| Cliente | Original relativo a `Bifrost_media` | Destino web | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| Adidas | `Adidas/logo-adidas-blanco.svg` | `logos/adidas.svg` | 19 734 | `d619923dfc1bb5af015d41c610f6e7c7f9f367a4d6b33380fb1e7065d3e7033c` |
| Samsung | `Samsung/logo-samsung-blanco.svg` | `logos/samsung.svg` | 13 507 | `01a3ae0bab876cca388a5c05cde84668b7eae909405511e652592a65ba1955fb` |
| HBO Max | `HBO/logo-hbo-max-blanco.svg` | `logos/hbo-max.svg` | 59 186 | `69accd780985d0d039a72b795c900ca495f92d7e4e716ec6d4ac7ac8c8000844` |
| Salcobrand | `Salcobrand/logo-salcobrand-blanco.svg` | `logos/salcobrand.svg` | 124 906 | `59a92c35fbeb81a1e1366ac5eea46a0d699c3b311b85885daf8b9fd82abdf390` |
| Score | `Score/logo-score-blanco.svg` | `logos/score.svg` | 33 788 | `e85989507b393efdd4d06c9d588b38d595b875a7b4e8a83fde13c0e6bf4755ca` |

### Videos originales

Los datos de la primera revisión se verificaron sobre copias temporales mediante lectura de las cabeceras MP4 y QuickTime, las descripciones de pistas, las tablas de muestras y la posición de `moov` y `mdat`. La duración corresponde al contenedor y el bitrate medio total se calculó con el tamaño y la duración. Para Samsung, la sección del piloto incluye las mediciones de FFprobe sobre la línea de tiempo reproducible.

| Cliente | Original relativo a `Bifrost_media` | Formato | Bytes | Duración (s) | Resolución y aspecto | FPS | Códec de video | Códec de audio y presencia | Mbps totales | `faststart` |
| --- | --- | --- | ---: | ---: | --- | ---: | --- | --- | ---: | --- |
| Adidas | `Adidas/adidas_video.mp4` | MP4 | 182 079 297 | 50,050 | 1920 × 1080 (16:9) | 23,976 | HEVC (`hvc1`) | Sí, 1 pista AAC-LC | 29,10 | No |
| Samsung | `Samsung/samsung_video.mp4` | MP4 | 87 412 641 | 39,829 | 3840 × 2160 (16:9) | 23,976 | H.264 (`avc1`) | Sí, 1 pista AAC-LC | 17,56 | Sí |
| HBO Max | `HBO/HBO_VIDEO.mov` | QuickTime MOV | 52 721 958 | 34,576 | 3840 × 2160 (16:9) | 23,976 | H.264 (`avc1`) | Sí, 1 pista PCM lineal | 12,20 | No |
| Salcobrand | `Salcobrand/SALCOBRAND_video.mov` | QuickTime MOV | 79 530 795 | 29,863 | 3840 × 2160 (16:9) | 23,976 | H.264 (`avc1`) | Sí, 2 pistas PCM lineal | 21,31 | No |
| Score | `Score/SCORE_video.mov` | QuickTime MOV | 84 673 998 | 30,197 | 1920 × 1080 (16:9) | 23,976 | H.264 (`avc1`) | Sí, 1 pista PCM lineal | 22,43 | No |

| Cliente | SHA-256 del video original |
| --- | --- |
| Adidas | `db2ce81c6a63eddf0502493fa95b06f040206397131ccb6a66bb0f699b6eec95` |
| Samsung | `a37cd081fef049703b220d16c9ed1fb3ff042e620dd3f6430155f69f701bfa1f` |
| HBO Max | `f3b221d2bbc0ab4be6cf27c71b48309fff85f678f62caf8fecd5070a0ed66eb5` |
| Salcobrand | `75550ea2215c893fc0a04f3adb83c43f7304b1c95b5bd5bad0dc14060ad5fae8` |
| Score | `ef51a8f17b7d9c01bbc41daefd8b2b9ec7e020d97f09dc6ca99e473d9a4ad29f` |

### Destinos y propuesta de optimización

Los destinos son relativos a `assets/clientes/`. La preparación 04A.2 generó los cinco WebP a partir del segundo `00:00:05` y el piloto de Samsung. La preparación 04A.3 completó los cuatro MP4 restantes. Los cinco videos están listos para reproducción local.

| Cliente | Póster WebP | Copia web MP4 | Estado y procesamiento | Peso medido del MP4 |
| --- | --- | --- | --- | ---: |
| Adidas | `posters/adidas.webp` · 36 920 bytes | `videos/adidas.mp4` | Verificado a 1080p. H.264, AAC original y `faststart`. | 69,73 MB |
| Samsung | `posters/samsung.webp` · 25 220 bytes | `videos/samsung.mp4` | Piloto local verificado a 1080p, con H.264, AAC original y `faststart`. | 24,87 MB medidos |
| HBO Max | `posters/hbo-max.webp` · 61 980 bytes | `videos/hbo-max.mp4` | Verificado a 1080p. H.264, AAC estéreo y `faststart`. | 25,84 MB |
| Salcobrand | `posters/salcobrand.webp` · 71 330 bytes | `videos/salcobrand.mp4` | Verificado a 1080p. H.264, AAC mono de la mezcla confirmada y `faststart`. | 17,95 MB |
| Score | `posters/score.webp` · 43 960 bytes | `videos/score.mp4` | Verificado a 1080p. H.264, AAC estéreo con margen de picos y `faststart`. | 31,58 MB |

### Piloto 04A.2 de Samsung

Winget devolvió un error de acceso. Se usó FFmpeg y FFprobe **9.1 Essentials** de Gyan en una carpeta de herramientas fuera del repositorio. Se verificó el SHA-256 del ZIP y la disponibilidad de `libwebp` y `libx264`. [Distribución de Gyan](https://www.gyan.dev/ffmpeg/builds/).

Los cinco WebP miden 1280 × 720. Se extrajeron a partir de `00:00:05`, con escala Lanczos, calidad 82 y nivel de compresión 6. Los cinco decodificaron e hicieron visible la escena en la revisión de fotogramas. Suman **239 410 bytes**. Con el piloto, los seis recursos nuevos ocupan **25 108 512 bytes**.

| Característica | Samsung original | Piloto local |
| --- | --- | --- |
| Resolución | 3840 × 2160 | 1920 × 1080 |
| Video | H.264 Main, nivel 5.1 | H.264 High, nivel 5.0 |
| Audio | AAC-LC estéreo a 48 kHz, 317 kb/s | La misma pista AAC-LC |
| FPS y duración reproducible | 24000/1001 y 39,789750 s | 24000/1001 y 39,789750 s |
| Bitrate medio de video | 17,22 Mb/s | 4,68 Mb/s |
| Bitrate medio total | 17,57 Mb/s | 5,00 Mb/s |
| Tamaño | 87 412 641 bytes | 24 869 102 bytes |
| `faststart` | Sí | Sí |

La reducción es de **71,55 %**. El cambio de 4K a 1080p requirió recodificar el video. Se usó `libx264`, preset `slow`, CRF 20, `-maxrate 6M -bufsize 12M`, escala Lanczos, `yuv420p` y `-movflags +faststart`. Se copió el audio AAC. Coincidieron los tiempos de presentación de los 954 fotogramas, los hashes y tiempos de los paquetes AAC reproducibles, y el SHA-256 del audio PCM decodificado. La decodificación completa del piloto terminó sin errores.

La comparación visual de seis instantes y un recorte al 100 % del fotograma de menor puntuación mostró textos y rostros legibles. El césped pierde textura fina en una jugada rápida. No se observaron bloques marcados ni cambios de color llamativos en las muestras. VMAF medio de **96,57** y mínimo de **78,35**, con el original reescalado a 1080p como referencia y 954 fotogramas evaluados. Chrome **157.0.8103.79** abrió ambos MP4 locales, inició la reproducción y alcanzó el final tras un salto. La prueba de navegador fue silenciada y la sincronía se comprobó por marcas de tiempo y comparación del audio.

### Optimización 04A.3 de Adidas, HBO Max, Salcobrand y Score

Las cuatro salidas usan MP4, H.264 High 4.1 mediante `libx264`, preset `slow`, 4 referencias, `yuv420p`, BT.709, 1920 × 1080 (16:9), los 24000/1001 FPS de origen y `faststart`. Se mantuvo el tamaño de Adidas y Score. HBO Max y Salcobrand se redujeron desde 4K con Lanczos. Los cuatro nuevos MP4 suman **145 099 212 bytes**. El total con el piloto Samsung es de **169 968 314 bytes**.

| Cliente | Original (bytes) | Web (bytes) | Reducción | Bitrate total (Mb/s) | Duración web (s) | Fotogramas | VMAF medio / mínimo | Aprobación técnica |
| --- | ---: | ---: | ---: | --- | ---: | ---: | --- | --- |
| Adidas | 182 079 297 | 69 726 205 | 61,71 % | 29,06 → 11,14 | 50,089 | 1 200 | 95,47 / 62,58 | Listo para uso local |
| HBO Max | 52 721 958 | 25 841 225 | 50,99 % | 12,20 → 5,98 | 34,576 | 829 | 98,83 / 84,28 | Listo para uso local |
| Salcobrand | 79 530 795 | 17 953 015 | 77,43 % | 21,31 → 4,81 | 29,863 | 716 | 96,86 / 88,76 | Listo para uso local |
| Score | 84 673 998 | 31 578 767 | 62,71 % | 22,43 → 8,37 | 30,197 | 724 | 96,72 / 86,82 | Listo para uso local |

| Cliente | Parámetros particulares | Calidad observada |
| --- | --- | --- |
| Adidas | HEVC Main 10 a H.264 de 8 bits con difusión de error. CRF 19, VBV de 11 Mb/s y búfer de 22 Mb. Se conservó el AAC-LC estéreo original a 320 kb/s. | La prueba inicial con CRF 20 y 8 Mb/s obtuvo 94,14 de promedio y 57,31 de mínimo. El ajuste conservó más grano y detalle de las líneas de barrido en el material de archivo. Aún se suaviza parte de la textura alrededor de 19,56 s. Los degradados de luz y los detalles de las camisetas se mantuvieron en las muestras. |
| HBO Max | CRF 20, VBV de 6 Mb/s y búfer de 12 Mb. PCM convertido a AAC-LC estéreo a 160 kb/s. | Títulos y logotipos legibles. El plano con bengalas de 28,82 s suaviza detalles del público y las camisetas. |
| Salcobrand | CRF 20, VBV de 6 Mb/s y búfer de 12 Mb. Conversión explícita de rango completo a limitado durante el escalado. AAC-LC mono a 128 kb/s. | El color, las luces y los textos se mantuvieron en las muestras. El primer plano iluminado en azul suaviza levemente la textura de la piel y el maquillaje. |
| Score | CRF 20, VBV de 8 Mb/s y búfer de 16 Mb. AAC-LC estéreo a 160 kb/s con −2,5 dB de ganancia previa. | Se conservaron la legibilidad de las latas y los degradados de fondo en las muestras. Se suaviza parte de la textura de la piel en el primer plano de 22,90 s. El primer AAC alcanzó +1,0 dBTP y el archivo final quedó en −1,4 dBTP. |

Las pistas PCM mono de Salcobrand tienen el mismo SHA-256 al decodificarse y coinciden en las 1 434 432 muestras y sus tiempos. Se confirmó ese contenido como mezcla final y se usó una copia en AAC mono. El MOV original conserva las dos pistas.

Los cuatro MP4 se decodificaron completos y conservaron los tiempos de presentación de todos los fotogramas. La comparación de audio a 48 kHz en seis ventanas por clip AAC recodificado encontró un desfase de cero muestras. En Adidas coincidieron todos los paquetes AAC, sus tiempos y el hash del PCM decodificado. FFprobe informa 50,133 s para el contenedor de origen y 50,089 s para la copia de Adidas. Los 44 ms de diferencia corresponden al retardo AAC inicial excluido de la duración de la copia. La duración de video permanece en 50,050 s.

Se calculó VMAF para todos los fotogramas a 1080p, con escalado y conversión de formato o rango equivalentes en las referencias cuando correspondía. La revisión visual comparó cinco fotogramas por marca, incluido el de menor VMAF. Chrome 157.0.8103.79 reprodujo los cuatro archivos locales en modo silenciado, resolvió saltos al centro y cerca del final y alcanzó el final en cada caso. Se verificaron los SHA-256 de origen antes y después del procesamiento y el del piloto Samsung al finalizar.

### Git, Docker y Coolify

- `.gitignore` excluye `/assets/clientes/videos/`. Los SVG y WebP verificados, y este inventario, pueden versionarse. Los originales residen fuera del repositorio.
- `.dockerignore` excluye el contexto por defecto y permite archivos individuales. El Dockerfile incluye `clientes.html`, los SVG, los WebP y los recursos comunes de la landing.
- Un build de Coolify desde GitHub no recibe los videos locales ignorados. Una opción es montar un volumen persistente de solo lectura en `/srv/bifrost/assets/clientes/videos/` y cargar aparte las copias web autorizadas. Esta ruta permite URLs del mismo origen con la CSP actual de Nginx. Otra opción es almacenamiento externo con URLs versionadas y una regla `media-src` para el origen autorizado. En ambos casos, verificar `Content-Type: video/mp4`, solicitudes de rango con respuesta `206 Partial Content` y comportamiento de caché.
- Inicio usa los cinco pósteres y logos y enlaza a los reproductores de Clientes. Los MP4 se solicitan al reproducir y el navegador informa si el archivo no está disponible.
