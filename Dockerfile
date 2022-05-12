FROM nginx:latest

COPY ./dist/. /usr/app
COPY ./img/. /usr/app/img
COPY ./infra/nginx.conf /etc/nginx/nginx.conf
COPY ./infra/default.conf /etc/nginx/conf.d/default.conf