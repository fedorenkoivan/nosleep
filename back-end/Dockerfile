FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY back-end/package*.json ./
RUN npm install

COPY back-end/ . 

EXPOSE 3000
CMD ["npx", "tsx", "watch", "server.ts"]