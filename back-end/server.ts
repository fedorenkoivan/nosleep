import express, { type Request, type Response } from 'express';
import { prisma } from './src/lib/prisma';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

// Отримати географічне розташування за координатами
app.get('/location', async (req: Request, res: Response) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ 
        error: 'Необхідно вказати параметри longitude та latitude' 
      });
    }

    const lon = parseFloat(longitude as string);
    const lat = parseFloat(latitude as string);

    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).json({ 
        error: 'Некоректні координати' 
      });
    }

    // Знаходимо округ (county)
    const county = await prisma.$queryRaw<Array<{
      name: string;
      abbrev: string;
      fips_code: string;
      pop2020: number;
    }>>`
      SELECT name, abbrev, fips_code, pop2020
      FROM ny_counties
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
      LIMIT 1
    `;

    // Знаходимо місто
    const city = await prisma.$queryRaw<Array<{
      name: string;
      muni_type: string;
      county: string;
      pop2020: number;
    }>>`
      SELECT name, muni_type, county, pop2020
      FROM ny_cities
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
      LIMIT 1
    `;

    // Знаходимо town якщо місто не знайдено
    const town = await prisma.$queryRaw<Array<{
      name: string;
      muni_type: string;
      county: string;
      pop2020: number;
    }>>`
      SELECT name, muni_type, county, pop2020
      FROM towns
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
      LIMIT 1
    `;

    // Знаходимо village
    const village = await prisma.$queryRaw<Array<{
      name: string;
      town: string;
      county: string;
      pop2020: number;
    }>>`
      SELECT name, town, county, pop2020
      FROM villages
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
      LIMIT 1
    `;

    const location = {
      coordinates: {
        longitude: lon,
        latitude: lat
      },
      county: county[0] || null,
      city: city[0] || null,
      town: town[0] || null,
      village: village[0] || null
    };

    res.json(location);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});