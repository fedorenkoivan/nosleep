# Backend API Deployment

Створіть новий Vercel проект тільки для backend:

## Структура
```
nosleep-api/
  api/
    index.ts  (перенаправляє на ../back-end/server.ts)
  back-end/
    server.ts
    src/
    prisma/
  vercel.json
  package.json
```

## vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "back-end/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/back-end/server.ts"
    }
  ]
}
```

## Швидкий спосіб

1. Створіть новий проект на Vercel для backend
2. Root Directory: `back-end`
3. Framework: Other
4. Build Command: `npm run build`
5. Output Directory: `dist`

Отримаєте URL типу: `https://nosleep-api.vercel.app`

### Проект 2: Frontend

Окремий проект для frontend:

1. Root Directory: `front-end`
2. Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_URL=https://nosleep-api.vercel.app`

---

# АБО спробуємо виправити монорепо
