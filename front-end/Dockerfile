FROM node:22-alpine
WORKDIR /app

COPY front-end/package*.json ./
RUN npm install

COPY front-end/ .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]