FROM node:12.18.3

LABEL MAINTAINER="zhouchijian"

USER root

WORKDIR /home/qqmusic

COPY . .

VOLUME ["./data","./bin"]

RUN npm config set registry https://registry.npm.taobao.org \
    && npm install cross-env -g

EXPOSE 80

CMD ["cross-env","PORT=80","node","/home/qqmusic/bin/www"]