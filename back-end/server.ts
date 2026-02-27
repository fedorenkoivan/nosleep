import express, { type Request, type Response } from 'express';
import { prisma } from './src/lib/prisma.js';

const app = express();
app.use(express.json());

const PORT = 3000;

// Типи для юрисдикцій
interface Jurisdiction {
  name: string;
  level: 'city' | 'county';
}

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

// Функція для отримання юрисдикції за координатами
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

// API для розрахунку податку
app.post('/calculate-tax', async (req: Request, res: Response) => {
  try {
    const { subtotal, longitude, latitude } = req.body;

    // Валідація вхідних даних
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
        error: 'Некоректні значення' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Сума повинна бути більше 0' 
      });
    }

    // Отримуємо юрисдикції (місто та округ)
    const jurisdictions = await getTaxJurisdiction(lng, lat);
    
    if (jurisdictions.length === 0) {
      return res.status(404).json({ 
        error: 'Координати поза межами штату Нью-Йорк' 
      });
    }

    // Визначаємо пріоритет: спочатку місто, потім округ (згідно з PUB-718)
    const city = jurisdictions.find(j => j.level === 'city');
    const county = jurisdictions.find(j => j.level === 'county');
    
    let compositeRate: number;
    let appliedLevel: string;
    let appliedName: string;
    let cityRate: number = 0;
    let countyRate: number = 0;
    
    // Отримуємо ставку округу (якщо є)
    if (county) {
      const countyTaxData = await prisma.county_tax.findFirst({
        where: {
          county: {
            contains: county.name,
            mode: 'insensitive'
          }
        }
      });
      
      if (countyTaxData) {
        countyRate = Number(countyTaxData.tax);
      }
    }
    
    // Отримуємо ставку міста (якщо є) - вона має пріоритет
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
        cityRate = Number(cityTaxData.tax);
        compositeRate = cityRate;
        appliedLevel = 'City';
        appliedName = cityTaxData.city;
      } else if (countyRate > 0) {
        compositeRate = countyRate;
        appliedLevel = 'County';
        appliedName = county!.name;
      } else {
        return res.status(404).json({ 
          error: `Податкова ставка не знайдена для ${city.name}` 
        });
      }
    } else if (countyRate > 0) {
      compositeRate = countyRate;
      appliedLevel = 'County';
      appliedName = county!.name;
    } else {
      return res.status(404).json({ 
        error: 'Не вдалося визначити податкову ставку' 
      });
    }

    // Розрахунок податку (compositeRate вже у відсотках, напр. 8.875)
    const compositeRateDecimal = compositeRate / 100;
    const state_rate = 0.04; // 4% фіксована ставка штату NY
    
    // Місцевий податок = Підсумковий - Державний
    const local_rate = compositeRateDecimal - state_rate;
    
    // Розбиваємо місцевий податок на складові: county + city + special
    let city_rate_component = 0;
    let county_rate_component = 0;
    let special_rate = 0;
    
    if (appliedLevel === 'City' && cityRate > 0) {
      // Місто має особливу ставку
      if (countyRate > 0) {
        // Є і міська і окружна ставка
        county_rate_component = (countyRate - 4) / 100; // Окружна частина (без державної)
        city_rate_component = local_rate - county_rate_component;
        
        // Якщо різниця від'ємна - це може бути помилка в даних
        if (city_rate_component < 0) {
          special_rate = Math.abs(city_rate_component);
          city_rate_component = 0;
        }
      } else {
        // Тільки міська ставка
        // Для великих міст як NYC розбиваємо на city + special (MCTD)
        if (compositeRate >= 8.5) {
          // NYC: 4% State + 4.5% City + 0.375% MCTD = 8.875%
          city_rate_component = 0.045; // 4.5%
          special_rate = local_rate - city_rate_component; // 0.375%
        } else {
          city_rate_component = local_rate;
        }
      }
    } else {
      // Тільки округ - весь місцевий податок йде в county
      county_rate_component = local_rate;
    }
    
    const tax_amount = amount * compositeRateDecimal;
    const total_amount = amount + tax_amount;
    
    // Розбивка податку по компонентах
    const state_tax = amount * state_rate;
    const county_tax = amount * county_rate_component;
    const city_tax = amount * city_rate_component;
    const special_tax = amount * special_rate;

    const result = {
      subtotal: parseFloat(amount.toFixed(2)),
      tax_amount: parseFloat(tax_amount.toFixed(2)),
      total_amount: parseFloat(total_amount.toFixed(2)),
      
      tax_breakdown: {
        composite_tax_rate: parseFloat(compositeRate.toFixed(3)) + '%',
        state_rate: parseFloat((state_rate * 100).toFixed(3)) + '%',
        state_tax: parseFloat(state_tax.toFixed(2)),
        county_rate: parseFloat((county_rate_component * 100).toFixed(3)) + '%',
        county_tax: parseFloat(county_tax.toFixed(2)),
        city_rate: parseFloat((city_rate_component * 100).toFixed(3)) + '%',
        city_tax: parseFloat(city_tax.toFixed(2)),
        special_rates: parseFloat((special_rate * 100).toFixed(3)) + '%',
        special_tax: parseFloat(special_tax.toFixed(2))
      },

      jurisdictions: {
        applied_level: appliedLevel,
        applied_name: appliedName,
        city: city?.name || null,
        county: county?.name || null
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

// API для отримання податкової ставки без розрахунку
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});