import express, { type Request, type Response } from 'express';
import { prisma } from './src/lib/prisma.js';
import * as orderService from './src/services/orderService.js';

const app = express();
app.use(express.json());

const PORT = 3000;

interface Jurisdiction {
  name: string;
  level: 'city' | 'county';
}

async function getTaxJurisdiction(lng: number, lat: number): Promise<Jurisdiction[]> {
  const jurisdictions = await prisma.$queryRaw<Jurisdiction[]>`
    SELECT name, 'city' as level FROM ny_cities 
    WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
    UNION ALL
    SELECT name, 'county' as level FROM ny_counties 
    WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
  `;
  return jurisdictions;
}

app.get('/tax-rate', async (req: Request, res: Response) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ 
        error: 'Необхідно вказати параметри longitude та latitude' 
      });
    }

    const lng = parseFloat(longitude as string);
    const lat = parseFloat(latitude as string);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ 
        error: 'Некоректні координати' 
      });
    }

    const jurisdictions = await getTaxJurisdiction(lng, lat);
    
    if (jurisdictions.length === 0) {
      return res.status(404).json({ 
        error: 'Координати поза межами штату Нью-Йорк' 
      });
    }

    const city = jurisdictions.find(j => j.level === 'city');
    const county = jurisdictions.find(j => j.level === 'county');
    
    let taxRate: number;
    let appliedLevel: string;
    let appliedName: string;
    
    // Пріоритет: спочатку місто, потім округ
    if (city) {
      const cityTaxData = await prisma.city_tax.findFirst({
        where: {
          city: {
            contains: city.name,
            mode: 'insensitive'
          }
        }
      });
      
      if (cityTaxData) {
        taxRate = Number(cityTaxData.tax);
        appliedLevel = 'City';
        appliedName = cityTaxData.city;
      } else if (county) {
        const countyTaxData = await prisma.county_tax.findFirst({
          where: {
            county: {
              contains: county.name,
              mode: 'insensitive'
            }
          }
        });
        
        if (!countyTaxData) {
          return res.status(404).json({ 
            error: `Податкова ставка не знайдена для ${city.name} та ${county.name}` 
          });
        }
        
        taxRate = Number(countyTaxData.tax);
        appliedLevel = 'County';
        appliedName = countyTaxData.county;
      } else {
        return res.status(404).json({ 
          error: `Податкова ставка для міста ${city.name} не знайдена` 
        });
      }
    } else if (county) {
      const countyTaxData = await prisma.county_tax.findFirst({
        where: {
          county: {
            contains: county.name,
            mode: 'insensitive'
          }
        }
      });
      
      if (!countyTaxData) {
        return res.status(404).json({ 
          error: `Податкова ставка для округу ${county.name} не знайдена` 
        });
      }
      
      taxRate = Number(countyTaxData.tax);
      appliedLevel = 'County';
      appliedName = countyTaxData.county;
    } else {
      return res.status(404).json({ 
        error: 'Не вдалося визначити юрисдикцію' 
      });
    }

    const taxRateDecimal = taxRate / 100;
    const state_rate = 0.04;
    const local_rate = taxRateDecimal - state_rate;

    res.json({
      jurisdiction_name: appliedName,
      jurisdiction_type: appliedLevel,
      tax_rate: parseFloat(taxRate.toFixed(3)) + '%',
      state_rate: '4.000%',
      local_rate: parseFloat((local_rate * 100).toFixed(3)) + '%',
      jurisdictions: {
        city: city?.name || null,
        county: county?.name || null
      },
      coordinates: { longitude: lng, latitude: lat }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.post('/orders', async (req: Request, res: Response) => {
  try {
    const { user_id, subtotal, longitude, latitude } = req.body;

    if (!user_id || !subtotal || !longitude || !latitude) {
      return res.status(400).json({ 
        error: 'Необхідно вказати user_id, subtotal, longitude та latitude' 
      });
    }

    const userId = parseInt(user_id);
    const amount = parseFloat(subtotal);
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(userId) || isNaN(amount) || isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ 
        error: 'Некоректні значення параметрів' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Сума повинна бути більше 0' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        error: `Користувача з ID ${userId} не знайдено` 
      });
    }

    const order = await orderService.createOrder({
      user_id: userId,
      subtotal: amount,
      longitude: lng,
      latitude: lat
    });

    res.status(201).json({
      message: 'Замовлення успішно створено',
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Помилка при створенні замовлення',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/orders', async (req: Request, res: Response) => {
  try {
    const { page, limit, user_id, status, from_date, to_date } = req.query;

    const params: any = {};

    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);

    if (user_id) {
      const userId = parseInt(user_id as string);
      if (!isNaN(userId)) {
        params.user_id = userId;
      }
    }

    if (status) {
      params.status = status as string;
    }

    if (from_date) {
      params.from_date = new Date(from_date as string);
    }

    if (to_date) {
      params.to_date = new Date(to_date as string);
    }

    const result = await orderService.getOrders(params);

    res.json(result);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Помилка при отриманні замовлень',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});