# Staging privado de Bifröst V1 en Hostinger

Guía de operación preparada el 24 de noviembre de 2026. El recurso propuesto es **bifrost-staging**. La preparación termina en GitHub. La creación del recurso, la operación del VPS, la transferencia y el primer despliegue quedan para una sesión autorizada.

## Arquitectura y estado

VS Code → rama feature en GitHub → aplicación independiente de Coolify → Dockerfile del repositorio → Nginx en 8080. El proxy que ya opere en el VPS termina HTTPS y autentica antes de enviar tráfico al contenedor. Los MP4 se guardan aparte y se montan únicamente en el recurso staging.

| Estado | Hallazgo o decisión |
| --- | --- |
| Verificado | Después de `git fetch origin`, la rama activa y su referencia remota coincidían en `835a9d6`, con 0 commits a cada lado. `origin/develop` estaba en `ef8bedc` y `origin/main` en `258349b`. |
| Verificado | Existían cambios previos en `.gitignore` y archivos locales ajenos a staging en `.claude/`, `AUDITORIA_BIFROST_V1.md` y `crm/`. La regla local de `auditoria-crm/` y esos archivos quedan fuera del commit de staging. No se detectaron fuentes del frontend sin seguimiento. |
| Verificado | Pasaron `node --check script.js`, `node scripts/validate-frontend.mjs` y `git diff --check`. El validador reconoce 28 rutas de desarrollo y 16 públicas. Se verificaron los bloques Bash añadidos al workflow. |
| Verificado | La ejecución de referencia de `835a9d6` aprobó el build y la prueba de Nginx en GitHub Actions. El cliente Docker local está instalado y el daemon no está disponible. [CI de referencia](https://github.com/bsepulvedam/bifrost-landing-v6/actions/runs/45498957724). |
| Preparado | Se amplió la CI para comparar el inventario real de archivos, comprobar UID/GID y legibilidad, MIME, compresión, caché y variantes de rutas editoriales. Un contenedor aparte comprueba HTTP 206 con bytes de prueba en un bind de solo lectura. La ejecución de la revisión publicada se consulta en el [workflow](https://github.com/bsepulvedam/bifrost-landing-v6/actions/workflows/frontend.yml?query=branch%3Afeature%2Farquitectura-bifrost-v1). |
| Pendiente de configuración | Recurso Coolify, destino Docker del VPS, proxy activo, subdominio, certificado, credencial de staging y ruta y montaje de los cinco MP4. |
| Requiere intervención | Un operador con acceso autorizado a Hostinger, Coolify, DNS y SSH debe confirmar esos datos, aprobar los medios para esta revisión y ejecutar los pasos correspondientes. |

La API de GitHub confirmó que el repositorio es **público**. Las fichas de revisión ya versionadas se pueden leer como código fuente en GitHub. El control de acceso de staging y la exclusión de Docker afectan al sitio servido. Si esos textos también deben ser confidenciales, su tratamiento en GitHub requiere una decisión separada. Mantener fuera de Git los secretos, originales, MP4 y material editorial adicional con acceso restringido.

## Auditoría de Docker y Nginx

- El `Dockerfile` conserva dos etapas con `nginx/nginx-unprivileged:stable-alpine`. La etapa de preparación usa root para retirar fragmentos editoriales. La final hereda el usuario no privilegiado, copia la salida filtrada a `/srv/bifrost` y expone `8080` dentro de Docker. El upstream indica `101:101` como valor por defecto. Para permisos del VPS hay que medir el UID/GID efectivo de la imagen desplegada y comprobar el mapeo del host. La etiqueta base es mutable. Registrar la identidad de la imagen que se pruebe. [Dockerfile upstream](https://github.com/nginx/docker-nginx-unprivileged/blob/main/stable/alpine/Dockerfile) · [Imagen sin privilegios](https://github.com/nginx/docker-nginx-unprivileged).
- `.dockerignore` excluye todo por defecto y habilita rutas de copia explícitas. El directorio público contiene 16 HTML, CSS, JS, `robots.txt`, dos PNG de Bifröst, cinco SVG y cinco WebP. Las doce fichas, MP4, originales, documentación, herramientas, CRM y BI quedan fuera del contexto y de lo servido. La CI compara el árbol público exacto, comprueba que no tenga enlaces simbólicos y prueba 404 para las fichas con extensión, sin extensión, con barra final y con normalización del camino.
- `deploy/nginx.conf` sirve `/` con `index.html` y el resto de rutas con `try_files $uri =404`, sin listado de directorios. `GET /healthz` responde 200 con `ok` y tipo `text/plain`. Es una señal de vida de Nginx. Para comprobar el contenido y los medios, consultar también sus propias rutas.
- Nginx usa la tabla MIME de la imagen. Conserva la CSP del mismo origen con `form-action 'none'`, `frame-ancestors 'none'`, `base-uri 'none'` y `object-src 'none'`. Envía `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Cache-Control: no-cache`. Este último permite revalidación. El HTML puede usar el tipo gzip predeterminado de Nginx y se habilitan CSS y JS de forma explícita. La prueba automatizada verifica gzip en CSS y MIME en imágenes. El transporte de medios se prueba con montaje separado, tipo `video/mp4` y `Content-Range`.
- Coolify puede construir desde Git con el build pack Dockerfile. Su proxy comunica por HTTP dentro de la red de Docker y gestiona TLS en el borde. Mantener Nginx como servidor estático y el puerto 8080 interno. [Dockerfile en Coolify](https://coolify.io/docs/applications/builds/dockerfile) · [Red de Coolify](https://coolify.io/docs/core/networking-in-coolify).

## Antes de crear el recurso

Confirmar en hPanel el servidor destino, el acceso autorizado, el host o IP de SSH, el puerto efectivo y el usuario. Obtener por un canal independiente la huella de la clave del host. Confirmar en el VPS el Ubuntu y Docker operativos, el espacio para builds, imágenes de rollback y medios, y los permisos sobre el destino de Coolify. Mantener el acceso de administración de acuerdo con la política del equipo y los puertos públicos 80/443 en el proxy para HTTP y HTTPS. El staging no necesita un puerto de aplicación público. [Acceso SSH al VPS](https://www.hostinger.com/support/5723772-how-to-connect-to-your-vps-via-ssh-at-hostinger/) · [Claves SSH en Hostinger](https://www.hostinger.com/support/4792364-how-to-use-ssh-keys-at-hostinger-vps/).

En **Servers → servidor de destino → Proxy**, confirmar el proxy y su estado. Si se autoriza la comprobación por terminal en ese servidor, contrastar la imagen del proxy integrado con:

~~~sh
docker inspect --format '{{.Config.Image}}' coolify-proxy
~~~

Si el contenedor tiene otro nombre o usa un proxy personalizado, identificarlo desde el panel del destino antes de aplicar esta guía. La elección Traefik/Caddy afecta a todos los recursos del servidor. Conservar el proxy existente. [Proxies integrados](https://coolify.io/docs/core/networking/proxy/overview).

## Crear la aplicación y proteger el dominio

1. Crear un proyecto o entorno **staging** independiente en Coolify y un recurso estándar **bifrost-staging**, en el destino Docker verificado. En la fuente, usar **Public Repository** con `https://github.com/bsepulvedam/bifrost-landing-v6`. El acceso de lectura por HTTPS está disponible. Si la política del equipo cambia la visibilidad, usar una GitHub App limitada al repositorio o una deploy key de solo lectura, según lo que autorice el propietario. [Fuentes Git de Coolify](https://coolify.io/docs/applications/sources/overview).
2. Elegir la rama `feature/arquitectura-bifrost-v1` y el build pack **Dockerfile**. Usar **Base Directory** `/`, **Dockerfile Location** `/Dockerfile` y **Ports Exposes** `8080`. Dejar el stage de build sin sobrescribir para obtener la imagen final. Mantener vacíos los mapeos de puertos del host y las variables de entorno de aplicación. No copiar configuraciones o secretos de producción.
3. Seleccionar **Manual deployments only** y revisar qué dominio quedó asignado. Eliminar del recurso nuevo los alias generados y cualquier URL de prueba HTTP antes del primer arranque. Es posible hacer un primer arranque interno por la red de Docker, sin dominio y sin mapeo de puerto. Si la instalación obliga a crear una ruta durante el arranque, esperar a que el nuevo recurso tenga la protección preparada.
4. Mantener las etiquetas **Managed by Coolify** cuando el proxy integrado y la versión instalada permitan la autenticación gestionada. En **General → Security → Authentication**, seleccionar **HTTP Basic Authentication**. Introducir una cuenta de staging y una contraseña larga, única y aleatoria generada en un gestor. Guardar las credenciales solo en Coolify y el gestor, con acceso limitado. Traefik y Caddy generan configuraciones distintas pero ambos documentan esta opción para aplicaciones estándar. Comprobar el comportamiento en el proxy realmente instalado. [Autenticación de Traefik](https://coolify.io/docs/core/networking/proxy/traefik/basic-auth) · [Autenticación de Caddy](https://coolify.io/docs/core/networking/proxy/caddy/basic-auth).
5. Si la versión instalada carece de la opción gestionada, mantener el recurso interno mientras el operador valida la alternativa del proxy. Con Traefik, usar un middleware BasicAuth exclusivo del recurso y asociarlo a cada router HTTPS de staging, conservando los middlewares existentes. Con Caddy, asociar Basic Auth al host completo de staging con la sintaxis de la versión de Caddy Docker Proxy instalada. En ambos casos usar un hash compatible generado fuera de Git, almacenarlo solo en Coolify y agregar el encabezado de noindex al host. Evitar cambios globales, rutas duplicadas y credenciales en argumentos o logs. Las guías oficiales del paso anterior describen las etiquetas manuales. El acceso externo se habilita solo después de verificar la configuración.
6. Elegir un subdominio bajo un dominio controlado por el equipo. En DNS, crear un registro A al IPv4 del servidor confirmado, y AAAA solo si el IPv6 funciona en ese destino. Usar un hostname que no se comparta con producción, el panel o el wildcard de otra aplicación. En **Domains**, añadir el dominio con **HTTPS**, destino interno `8080`, sin prefijo de ruta, y activar **Redirect HTTP to HTTPS**. Si los certificados usan ACME, verificar que DNS, puertos y el mecanismo de desafío correspondan al proxy. No activar rutas extra durante esta preparación. [Dominios y TLS de Coolify](https://coolify.io/docs/core/networking/domains).
7. En el dominio de staging, seleccionar **Search engine indexing → Noindex** para obtener `X-Robots-Tag: noindex, nofollow`. El encabezado complementa la autenticación. Si existe un CDN para ese hostname, desactivar su caché compartida para evitar servir respuestas autenticadas a otra sesión. La autenticación debe cubrir HTML, assets, `robots.txt`, videos y la ruta externa `/healthz`. La sonda de salud interna no atraviesa el proxy.
8. En **Healthcheck**, usar HTTP `GET`, host interno `127.0.0.1`, puerto `8080`, ruta `/healthz`, código esperado `200` y cuerpo `ok`. Confirmar que la imagen cuenta con `curl` o `wget`. El workflow lo comprueba y el operador debe contrastarlo en el destino. [Healthchecks de Coolify](https://coolify.io/docs/applications/configuration/health-checks).

Mantener el recurso interno si la autenticación no se aplica a todas sus rutas o si existe un alias sin protección. HTTP debe redirigir a HTTPS sin servir el contenido ni aceptar credenciales. La primera ruta pública solo se habilita con la protección configurada. Antes de compartirla, verificar el certificado, el reto de autenticación y el alcance de la protección desde una sesión limpia.

## Almacenamiento persistente de los MP4

La propuesta es montar `/opt/bifrost/media/videos/` del VPS en `/srv/bifrost/assets/clientes/videos/`. El servidor y la ruta fuente siguen pendientes de confirmación. En **Persistent Storage → Add → Directory Mount** del recurso nuevo, elegir el directorio dedicado una vez confirmado. La documentación de Coolify describe el bind por directorio y no garantiza un selector de solo lectura en toda versión. Usar la opción nativa de solo lectura si está disponible y verificar el resultado con `RW=false`. Si la versión solo genera `RW=true`, mantener el montaje pendiente y acordar una alternativa con el operador. Los permisos POSIX pueden limitar lo que escribe el usuario de Nginx, pero no equivalen a un montaje de solo lectura. `Custom Docker Options` no es un mecanismo documentado para añadir ese bind. [Directory Mount en Coolify](https://coolify.io/docs/core/persistent-storage/storage-mounts/bind-mounts) · [Opciones Docker de Coolify](https://coolify.io/docs/applications/builds/custom-docker-options) · [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/).

En el VPS autorizado, identificar el contenedor por el recurso **bifrost-staging**. Tras el arranque interno, acordar el propietario del directorio, el grupo numérico compartido con el proceso y los permisos. Como referencia, los directorios pueden ser `0750` y los archivos `0640` si el grupo efectivo de Nginx tiene lectura y travesía apropiadas. Comprobar los directorios padre para acceso del operador y el mapeo de IDs si Docker usa user namespaces o rootless. Evitar permisos mundiales de escritura, modificar rutas de producción o montar una carpeta que también contenga originales o manifiestos.

Los siguientes son comandos de diagnóstico de solo lectura. Ejecutarlos con `staging_container` y `media_source` ya asignados por el operador a valores comprobados en ese VPS. La comprobación de montaje y lectura corresponde a una ejecución posterior con el bind configurado.

~~~sh
docker inspect --format '{{.Name}} {{.Config.Image}} {{.Config.User}}' "$staging_container"
docker exec "$staging_container" id
stat -c '%F %a %u:%g %n' "$media_source"
namei -l -- "$media_source"
docker inspect --format '{{range .Mounts}}{{println .Type .Source .Destination .RW}}{{end}}' "$staging_container"
docker exec "$staging_container" sh -ec '
  for name in adidas samsung hbo-max salcobrand score; do
    test -r "/srv/bifrost/assets/clientes/videos/$name.mp4"
  done
'
~~~

La fila esperada del montaje es `bind`, con la fuente verificada, el destino exacto y `false` en `RW`. Inspeccionar también que `8080` no esté publicado en la interfaz del host. Si la carpeta no está lista, mantener el recurso interno o revisar la página solo con los pósteres según lo que autorice el equipo.

## Transferencia por SFTP y la suma de verificación

Usar únicamente las cinco copias optimizadas que se enumeran abajo. El conjunto local verificado ocupa **169 968 314 bytes** y Git lo ignora.

| Archivo | Bytes | SHA-256 de la copia optimizada |
| --- | ---: | --- |
| `adidas.mp4` | 69 726 205 | `dc81fbba0f863d372844a072283c6c9e02604d8c61c7013eb649522d6c774965` |
| `samsung.mp4` | 24 869 102 | `fd4595f613b6fade14f7a0c86974a71136e083325730eeb07b393970449bbfa1` |
| `hbo-max.mp4` | 25 841 225 | `8677b02859801d177f54ee70de4b2043d7b28c105f1cf606566ccb31e287432c` |
| `salcobrand.mp4` | 17 953 015 | `4929e5a68c73231e78412c0cdd90a17e95340f9c88d951691d7d372a722da67b` |
| `score.mp4` | 31 578 767 | `d56a429333128e264d021679ec79fa2deba0a5f1a7a055aaf1732d92ec2cab07` |

1. Tras autorización, crear un directorio de recepción vacío y privado fuera de la ruta servida. Usar una cuenta de transferencia con permisos para ese directorio y una clave SSH dedicada si corresponde. Comparar la huella de host con la obtenida del operador o la consola de confianza. Con el host ya registrado y verificado, iniciar `sftp -o StrictHostKeyChecking=yes alias-ssh-verificado` si se configuró un alias con el usuario y puerto correctos.
2. En la sesión SFTP, usar `lcd assets/clientes/videos` desde la raíz del checkout, seleccionar con `cd` el directorio de recepción preparado y ejecutar `put` por cada nombre exacto de la tabla. Usar `ls` para contrastar el listado. El directorio debe contener solo las cinco copias. [SFTP en un VPS Hostinger](https://www.hostinger.com/support/8868611-how-to-connect-to-vps-using-sftp-at-hostinger/).
3. Desde la carpeta receptora verificada, ejecutar `sha256sum -- adidas.mp4 samsung.mp4 hbo-max.mp4 salcobrand.mp4 score.mp4` y comparar las cinco sumas con la tabla. Ante una diferencia, detener esa tanda. Instalar el lote verificado en el directorio dedicado mediante el operador y comprobar de nuevo los cinco SHA-256. Conservar el lote previo fuera del directorio nuevo si existe. Mantener manifiestos y otras evidencias fuera del bind.

## Primer despliegue y aceptación

1. En **bifrost-staging**, iniciar el primer despliegue manual cuando se autorice. Confirmar en **Deployment Logs** el SHA de la rama, los dos stages y el arranque. Revisar la sonda de salud, el usuario efectivo y el montaje desde **Runtime Logs** o la terminal del contenedor. Verificar el certificado y la redirección del hostname de staging.
2. Desde una sesión limpia, comprobar HTTP **401** y `WWW-Authenticate` al solicitar `/`, `/clientes.html`, un WebP, un MP4 y `/healthz` por HTTPS. Comprobar que el acceso directo por IP, los alias y el puerto 8080 no sirvan el recurso. Tras autenticar, verificar `X-Robots-Tag`, CSP, `nosniff`, caché, MIME y resultados 200 de las páginas y assets. Comprobar autenticado el **404** de las fichas y rutas privadas, ya que un 401 sin credenciales solo demuestra la protección del proxy.
3. En una terminal interactiva, asignar `staging_url` a la URL HTTPS confirmada y `staging_user` al usuario de revisión. Consultar el video después de validar los cinco hashes y el bind. Con solo el nombre de usuario, curl pide la contraseña de forma interactiva. Mantener la verificación TLS habilitada.

~~~sh
curl --silent --show-error --dump-header - --output /dev/null \
  "$staging_url/assets/clientes/videos/samsung.mp4"
curl --fail --silent --show-error --user "$staging_user" \
  --range 0-1023 --dump-header - --output /dev/null \
  "$staging_url/assets/clientes/videos/samsung.mp4"
~~~

La primera solicitud debe devolver `401`. La segunda debe devolver `206`, `Content-Type: video/mp4` y `Content-Range: bytes 0-1023/24869102`. Repetir la comprobación de rango para las otras cuatro marcas según su tamaño. Probar los cinco reproductores en navegador y saltar a mitad y cerca del final. Revisar la pestaña Red para comprobar cero MP4 al cargar Inicio y Clientes, y solicitudes del medio seleccionado al reproducir. Con el montaje ausente, los MP4 devuelven 404 después de autenticar y los pósteres quedan visibles. La prueba de CI mide transporte con un archivo sintético de diez bytes. Reproducción y búsqueda del lote real a través del proxy corresponden a staging.

Para rendimiento, hacer tres cargas autenticadas de Inicio con caché fría y perfil móvil controlado. Registrar navegador, perfil, latencia, LCP y CLS, y medir interacciones representativas para investigar INP. Comparar `LCP ≤ 2,5 s`, `CLS ≤ 0,1` e `INP ≤ 200 ms` contra mediciones que permitan sustentarlo. El laboratorio anterior en Chrome obtuvo 944 ms de LCP mediano y CLS 0 en local. El VPS y el proxy aún no tienen mediciones. Revisar también que el ancho de banda del video no se comparta con solicitudes automáticas y que la compresión del contenido textual no se duplique de manera problemática.

## Actualizar y revertir

Por ahora, el flujo es push a la rama feature → CI verde → revisión del SHA → **Deploy** manual de **bifrost-staging** → comprobaciones de acceso, montaje y reproducción. Activar **Deploy on push** únicamente con autorización, tras una primera revisión satisfactoria y con almacenamiento y autenticación persistentes. Si se autoriza una GitHub App o webhook, limitarlo al repositorio y al recurso staging. No hacer que un push a `main`, `develop` ni un preview de PR publique staging. [Auto deploy de Coolify](https://coolify.io/docs/applications/sources/github/auto-deploy).

Para volver atrás, identificar en **Rollback** una imagen conservada por SHA y verificar su compatibilidad con la configuración actual de red y medios. Seleccionarla en el recurso staging y volver a correr las pruebas de acceso y reproducción. El rollback de la imagen usa la configuración de runtime vigente y no restaura el directorio persistente. Si la imagen ya no está, acordar un commit de reversión en la rama de trabajo y validar su CI antes de desplegar. Conservar la ruta privada mientras se recupera el servicio si falló la autenticación. [Rollback de Coolify](https://coolify.io/docs/applications/deployments/rollbacks).

## Diagnóstico rápido

| Síntoma | Comprobar |
| --- | --- |
| HTTP 200 sin autenticación en una ruta de contenido | Retirar el dominio del recurso staging y revisar alias, routers, etiquetas y caché compartida antes de reabrirlo. |
| Certificado inexistente o de otro host | Resolución A y AAAA, puertos del proxy, dominio repetido y logs ACME. |
| Proxy 502, 404 o no disponible | Red Docker, puerto interno, estado de salud y cliente HTTP dentro de la imagen. |
| MP4 403 o 404 después de autenticar | Ruta fuente, destino y `RW`, nombre exacto, SHA-256 y lectura con UID/GID de Nginx. |
| Petición con Range devuelve 200 | Confirmar el encabezado enviado, comparar desde Nginx y desde HTTPS y revisar el proxy o CDN. |
| Ficha de revisión devuelve 200 | Verificar el SHA, el inventario de la imagen final y que el proxy apunta al recurso correcto. |

## Lista antes del primer despliegue

- [ ] Autorización para crear y desplegar el recurso separado y para usar los medios en staging.
- [ ] SHA de la rama verificado en GitHub y CI de esa revisión aprobada.
- [ ] Destino y proxy reales comprobados. Acceso SSH con huella verificada.
- [ ] Dockerfile, puerto 8080 interno y healthcheck configurados. Sin mapeos públicos ni alias de prueba.
- [ ] Autenticación del host completo configurada antes de habilitar la ruta, con contraseña en el gestor.
- [ ] DNS y HTTPS preparados, redirección configurada y noindex aplicado por dominio.
- [ ] Ruta y UID/GID efectivos comprobados. Transferencia autorizada, cinco hashes verificados y bind de solo lectura, si la revisión incluye videos.
- [ ] Pruebas de aceptación y rollback asignadas al operador. Auto deploy aún manual.
