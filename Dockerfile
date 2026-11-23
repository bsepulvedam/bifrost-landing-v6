FROM nginx/nginx-unprivileged:stable-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html producciones.html soluciones.html nosotros.html contacto.html styles.css script.js /srv/bifrost/
COPY assets/bifrost-logo.png assets/bifrost-footer.png /srv/bifrost/assets/
COPY assets/clientes/cliente-01.jpg assets/clientes/cliente-02.jpg assets/clientes/cliente-03.jpg assets/clientes/cliente-04.jpg assets/clientes/cliente-05.jpg /srv/bifrost/assets/clientes/

EXPOSE 8080
