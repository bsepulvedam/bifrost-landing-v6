# Despliegue de Bifrost V1 en Coolify

Bifrost V1 es un sitio estático multipágina. La ruta prevista es **GitHub → Coolify → imagen Nginx → proxy HTTPS** en el VPS Hostinger KVM 2. El frontend estático se empaqueta directamente. Los reproductores de Clientes requieren almacenamiento aparte para sus MP4. La aprobación editorial y la activación del despliegue siguen pendientes.

## Decisión de arquitectura

Se evaluó primero **Static**. Coolify empaqueta los archivos de su directorio base en una imagen Nginx. El código público está en la raíz, donde también hay documentación y pueden existir módulos privados. Static sería adecuado si el repositorio tuviera un directorio independiente con solo la salida pública. Esta entrega usa **Dockerfile** para producir ese aislamiento sin mover ni duplicar los archivos existentes. Docker Compose aportaría orquestación adicional para un solo contenedor. [Coolify, Static](https://coolify.io/docs/applications/builds/static). [Coolify, Dockerfile](https://coolify.io/docs/applications/builds/dockerfile).

| Archivo | Función |
| --- | --- |
| `Dockerfile` | Imagen de Nginx sobre Alpine, sin privilegios, con las rutas `COPY` declaradas una por una. Directorio público `/srv/bifrost` y puerto interno `8080`. |
| `.dockerignore` | Excluye por defecto todo el contexto y habilita solo las fuentes necesarias. Archivos sensibles, informes, herramientas de CI, CRM y BI quedan fuera. |
| `deploy/nginx.conf` | Atiende las rutas estáticas con 404 real, expone `/healthz`, desactiva listado de directorios, comprime texto, aplica revalidación y añade CSP, `nosniff` y política de referer. |
| `.github/workflows/frontend.yml` y `scripts/validate-frontend.mjs` | CI de lectura para push y PR. Comprueba sintaxis, referencias locales, elementos básicos de accesibilidad, rutas sensibles registradas y lista pública. En el runner construye y prueba el contenedor en loopback. No contiene credenciales ni llamadas a Coolify. |

La lista pública de la imagen incluye las seis páginas, CSS, JavaScript, las dos imágenes de Bifröst, cinco pósteres WebP y cinco logos SVG. Los MP4 locales se mantienen fuera del contexto de construcción y de Git. La aprobación para publicar cada pieza sigue el inventario editorial. La etiqueta base `stable-alpine` recibe actualizaciones del mantenedor. Registrar el digest probado al promover una versión, fijarlo cuando el flujo requiera reproducibilidad y planificar su actualización. [Nginx unprivileged](https://github.com/nginx/docker-nginx-unprivileged). [Docker, contexto de compilación](https://docs.docker.com/build/concepts/context/#dockerignore-files).

## GitHub y ramas

- `main` es la rama estable prevista para producción. En el diagnóstico inicial, la rama local y `origin/main` apuntaban a `258349b`. La consulta directa a GitHub confirmó que la rama predeterminada era `main` y que `develop` aún no existía. El remoto configurado es `https://github.com/bsepulvedam/bifrost-landing-v6`.
- `develop` integra el frontend. Antes de hacer push, revisar `git status`, `git diff --check`, el diff preparado y las referencias remotas. Agregar archivos de la tarea por ruta y validar el árbol de Git, la ausencia de secretos y la autorización de medios. Si la rama remota avanzó, integrar y volver a validar mediante el flujo acordado. Usar push normal a `develop`.
- Promover a `main` mediante PR autorizado y desplegar solo cuando corresponda. Configurar protección en GitHub con revisión y estado requerido `validate` cuando el workflow se haya ejecutado. La protección efectiva depende de la configuración del repositorio. [GitHub, ramas protegidas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
- Si falta autenticación en otra máquina, usar Git Credential Manager con su flujo interactivo o una sesión autenticada con `gh auth login`. Para Coolify, usar la instalación de GitHub App seleccionando exclusivamente este repositorio. Mantener tokens, claves privadas y secretos de webhook en el proveedor y fuera de Git. [Coolify, GitHub App](https://coolify.io/docs/applications/sources/github/app).

## Configuración del recurso

1. En el Coolify existente, usar un proyecto y un entorno dedicados a la landing. Crear una aplicación desde su GitHub App instalada con acceso a este repositorio. Para una prueba autorizada, usar un entorno separado con `develop` y un dominio de prueba. El recurso futuro de producción apunta a `main`.
2. Seleccionar **Dockerfile**, **Base Directory** `/`, **Dockerfile Location** `/Dockerfile` y **Ports Exposes** `8080`. El proceso escucha dentro del contenedor. Dejar vacíos los port mappings del host y las variables de build o runtime. El área pública la fija Nginx en `/srv/bifrost`. Para habilitar los reproductores, seguir el apartado de almacenamiento. [Configuración del build pack](https://coolify.io/docs/applications/builds/dockerfile).
3. En **Domains**, registrar el host aprobado con `https://`. Con el único puerto interno `8080`, Coolify usa ese valor para enrutar al contenedor. Si la interfaz solicita un puerto explícito, usar `8080` como destino interno. El visitante entra por el puerto HTTPS del proxy. Verificar DNS, emisión y renovación del certificado y redirección HTTP→HTTPS. Aplicar HSTS en el proxy después de comprobar HTTPS y definir el alcance de los subdominios. [Coolify, dominios](https://coolify.io/docs/core/networking/domains).
4. En **Healthcheck**, configurar HTTP GET a `http://127.0.0.1:8080/healthz` con 200 esperado. Confirmar que el contenedor tiene `curl` o `wget` y comprobar la petición desde su terminal. La CSP actual admite recursos del mismo origen y deniega formularios y enmarcado. Si se introduce una integración más adelante, revisar su política antes de publicar. [Coolify, health checks](https://coolify.io/docs/applications/configuration/health-checks).
5. Dejar **Advanced → Deployment → Auto deploy** en **Manual deployments only** mientras la V1 esté incompleta. La GitHub App puede activar despliegues por push al crear la aplicación. Comprobar el valor antes de conectar el flujo operativo. Con autorización y tras verificar la primera publicación, seleccionar **Deploy on push (webhooks)** en el recurso de `main` y comprobar la recepción del evento asociado al commit promovido. El workflow de CI no activa Coolify. [Coolify, despliegues por push](https://coolify.io/docs/applications/sources/github/auto-deploy).

### Almacenamiento de videos

En una configuración autorizada, montar un directorio persistente de solo lectura en `/srv/bifrost/assets/clientes/videos/` con `adidas.mp4`, `samsung.mp4`, `hbo-max.mp4`, `salcobrand.mp4` y `score.mp4`. Mantener los archivos legibles por Nginx y verificar HTTP 206 con una solicitud de rango. En una imagen sin ese montaje, el carrusel y los pósteres funcionan y los reproductores informan que el video no está disponible al intentar abrirlo.

## Validación y publicación

Comprobaciones sin dependencias npm:

```sh
node --check script.js
node scripts/validate-frontend.mjs
git diff --check
```

La comprobación estática exige que los cinco reproductores estén en Clientes con `preload="none"` y que sus MP4 se mantengan fuera de Git y del artefacto de Docker. La CI comprueba que los pósteres y logos respondan y que los cinco videos devuelvan 404 en la imagen sin almacenamiento montado.

En una máquina con Docker activo, reproducir la prueba de CI:

```sh
docker build --pull -t bifrost-v1 .
docker run --rm -d --name bifrost-v1-check -p 127.0.0.1:8080:8080 bifrost-v1
docker exec bifrost-v1-check nginx -t
curl -fsS http://127.0.0.1:8080/healthz
curl -fsSI http://127.0.0.1:8080/
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/.git/config
docker stop bifrost-v1-check
```

Verificar HTTP 200 en las seis páginas y los recursos de la lista, MIME coherente, cabeceras de seguridad y HTTP 404 en rutas privadas, documentación y rutas inexistentes. Con almacenamiento montado, verificar HTTP 206 para una solicitud con `Range`. El workflow ejecuta la prueba del contenedor en el runner.

En una publicación autorizada, abrir **Deployment Logs** y comprobar que la revisión clonada coincide con el SHA previsto de `main`. Consultar **Runtime Logs** para arranque y errores. Verificar HTTPS, `/healthz`, rutas, cabeceras, formulario o enlace de contacto definitivo, imágenes, consola y navegación por teclado. Registrar el SHA y la hora del despliegue en el control de versiones o en el registro de la publicación.

## Reversión

1. Conservar versiones anteriores en la retención de imágenes de Coolify y registrar el SHA de la última publicación estable.
2. Si falla una publicación, poner el recurso en modo manual si es necesario para que un webhook no reemplace de nuevo la versión. En **Rollback**, elegir la imagen retenida del SHA estable y seguir **Deployment Logs**. Verificar salud, dominio y rutas.
3. Si la imagen ya no está retenida, restaurar mediante un PR autorizado que revierta el cambio en `main` y desplegar ese nuevo commit. Revisar la configuración de dominio y variables actual al reutilizar una imagen anterior. [Coolify, rollback y retención](https://coolify.io/docs/applications/deployments/rollbacks).
