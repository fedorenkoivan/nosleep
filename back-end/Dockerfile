FROM node:22-alpine
WORKDIR /app

COPY back-end/package*.json ./
RUN npm install

COPY back-end/ . 

EXPOSE 3000
CMD ["node", "--watch", "server.ts"]