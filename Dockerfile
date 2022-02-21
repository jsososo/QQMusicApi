FROM node:12.18.3

USER root

WORKDIR /home/qqmusic

COPY . .

VOLUME ["./data","./bin"]

RUN npm config set registry https://registry.npmmirror.com \
    && npm install && npm install cross-env -g

EXPOSE 80

CMD ["cross-env","PORT=80","node","/home/qqmusic/bin/www"]
