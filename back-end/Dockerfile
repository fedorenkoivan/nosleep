FROM node:22-alpine

WORKDIR /app

# Встановлюємо build dependencies для bcrypt
RUN apk add --no-cache python3 make g++

# Копіюємо package files
COPY package*.json ./
RUN npm install

# Копіюємо весь код
COPY . .

# Генеруємо Prisma Client
RUN npx prisma generate

# Компілюємо TypeScript
RUN npm run build

EXPOSE 3000

# Запускаємо compiled server
CMD ["node", "dist/server.js"]