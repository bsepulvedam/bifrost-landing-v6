FROM nginx/nginx-unprivileged:stable-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html producciones.html soluciones.html nosotros.html clientes.html contacto.html styles.css script.js /srv/bifrost/
COPY assets/bifrost-logo.png assets/bifrost-footer.png /srv/bifrost/assets/
COPY assets/clientes/posters/adidas.webp assets/clientes/posters/samsung.webp assets/clientes/posters/hbo-max.webp assets/clientes/posters/salcobrand.webp assets/clientes/posters/score.webp /srv/bifrost/assets/clientes/posters/
COPY assets/clientes/logos/adidas.svg assets/clientes/logos/samsung.svg assets/clientes/logos/hbo-max.svg assets/clientes/logos/salcobrand.svg assets/clientes/logos/score.svg /srv/bifrost/assets/clientes/logos/

EXPOSE 8080
