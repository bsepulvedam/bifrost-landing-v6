FROM nginx/nginx-unprivileged:stable-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html producciones.html soluciones.html nosotros.html clientes.html contacto.html styles.css script.js robots.txt /srv/bifrost/
COPY assets/bifrost-logo.png assets/bifrost-footer.png /srv/bifrost/assets/
COPY assets/clientes/posters/adidas.webp assets/clientes/posters/samsung.webp assets/clientes/posters/hbo-max.webp assets/clientes/posters/salcobrand.webp assets/clientes/posters/score.webp /srv/bifrost/assets/clientes/posters/
COPY assets/clientes/logos/adidas.svg assets/clientes/logos/samsung.svg assets/clientes/logos/hbo-max.svg assets/clientes/logos/salcobrand.svg assets/clientes/logos/score.svg /srv/bifrost/assets/clientes/logos/

COPY producciones/cobertura-de-eventos.html producciones/comerciales-y-campanas.html producciones/contenido-para-redes-sociales.html producciones/postproduccion-vfx.html producciones/videos-con-ia.html producciones/videos-corporativos.html /srv/bifrost/producciones/
COPY soluciones/agencias-y-productoras.html soluciones/instituciones-publicas.html soluciones/marcas-y-empresas.html soluciones/restaurantes-bares-y-comercio.html /srv/bifrost/soluciones/

EXPOSE 8080
