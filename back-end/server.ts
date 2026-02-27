import express, { type Request, type Response } from 'express';
import { prisma } from './src/lib/prisma.js';
import * as orderService from './src/services/orderService.js';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

type MulterRequest = Request & { file?: Express.Multer.File };

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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

// POST /calculate-tax - Розрахунок податку без створення замовлення
app.post('/calculate-tax', async (req: Request, res: Response) => {
  try {
    const { subtotal, longitude, latitude } = req.body;

    // Валідація
    if (!subtotal || !longitude || !latitude) {
      return res.status(400).json({ 
        error: 'Необхідно вказати subtotal, longitude та latitude' 
      });
    }

    const amount = parseFloat(subtotal);
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(amount) || isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ 
        error: 'Некоректні значення параметрів' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Сума повинна бути більше 0' 
      });
    }

    // Використовуємо функцію з orderService
    const taxResult = await orderService.calculateTax(amount, lng, lat);

    // Форматуємо відповідь
    const result = {
      subtotal: parseFloat(amount.toFixed(2)),
      tax_amount: taxResult.tax_amount,
      total_amount: taxResult.total_amount,
      
      tax_breakdown: {
        composite_tax_rate: `${taxResult.compositeRate.toFixed(3)}%`,
        state_rate: '4.000%',
        state_tax: taxResult.state_tax,
        county_rate: `${((taxResult.county_tax / amount) * 100).toFixed(3)}%`,
        county_tax: taxResult.county_tax,
        city_rate: `${((taxResult.city_tax / amount) * 100).toFixed(3)}%`,
        city_tax: taxResult.city_tax,
        special_rates: `${((taxResult.special_tax / amount) * 100).toFixed(3)}%`,
        special_tax: taxResult.special_tax
      },

      jurisdictions: {
        applied_level: taxResult.appliedLevel,
        applied_name: taxResult.appliedName,
        city: taxResult.cityName,
        county: taxResult.countyName
      },

      location: {
        coordinates: { longitude: lng, latitude: lat }
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ 
      error: 'Помилка при розрахунку податку',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// ============================================
// ORDERS ENDPOINTS
// ============================================

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

const upload = multer({ storage: multer.memoryStorage() });

app.post('/orders/import', upload.single('file'), async (req: MulterRequest, res: Response) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const userId = parseInt(user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'user_id must be a number' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: `User with ID ${userId} not found` });
    }

    const records: any[] = await new Promise((resolve, reject) => {
      const results: any[] = [];
      Readable.from(req.file!.buffer)
        .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Step 1: validate all rows first
    const validRows: { record: any; lng: number; lat: number; amount: number }[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const record of records) {
      const { id, longitude, latitude, subtotal } = record;
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const amount = parseFloat(subtotal);

      if (isNaN(lng) || isNaN(lat)) {
        failed.push({ id, reason: 'Invalid coordinates' });
        continue;
      }
      if (isNaN(amount) || amount <= 0) {
        failed.push({ id, reason: 'Invalid subtotal' });
        continue;
      }

      validRows.push({ record, lng, lat, amount });
    }

    // Step 2: process all valid rows in parallel
    const BATCH_SIZE = 20;
    const ordersToInsert: any[] = [];

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async ({ record, lng, lat, amount }) => {
          const { id, timestamp } = record;
          try {
            const taxResult = await orderService.calculateTax(amount, lng, lat);
            return {
              success: true,
              id,
              data: {
                user_id:              userId,
                subtotal:             amount,
                longitude:            lng,
                latitude:             lat,
                tax_rate:             taxResult.compositeRate / 100,
                state_tax:            taxResult.state_tax,
                county_tax:           taxResult.county_tax,
                city_tax:             taxResult.city_tax,
                special_tax:          taxResult.special_tax,
                tax_amount:           taxResult.tax_amount,
                total_amount:         taxResult.total_amount,
                applied_jurisdiction: taxResult.appliedName,
                jurisdiction_level:   taxResult.appliedLevel,
                county_name:          taxResult.countyName,
                city_name:            taxResult.cityName,
                status:               'pending',
                ...(timestamp ? { created_at: new Date(timestamp) } : {}),
              }
            };
          } catch (err) {
            return {
              success: false,
              id,
              reason: err instanceof Error ? err.message : 'Failed to process order',
            };
          }
        })
      );

      for (const result of batchResults) {
        if (result.success) {
          ordersToInsert.push(result);
        } else {
          failed.push({ id: result.id, reason: result.reason! });
        }
      }
    }

    // Step 3: batch insert all successful orders at once
    const success: { id: string; order_id: number }[] = [];

    if (ordersToInsert.length > 0) {
      const inserted = await Promise.all(
        ordersToInsert.map(({ id, data }) =>
          prisma.order.create({ data }).then((order) => ({ id, order_id: order.id }))
        )
      );
      success.push(...inserted);
    }

    res.status(201).json({
      message: `Imported ${success.length} orders, ${failed.length} failed`,
      imported: success.length,
      failed: failed.length,
      errors: failed,
      orders: success,
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      error: 'Failed to import orders',
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[/orders/import] completed in ${duration}s`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});