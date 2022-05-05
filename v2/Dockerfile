FROM nginx:latest

COPY ./dist/. /usr/app
COPY ./img/. /usr/app/img
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf