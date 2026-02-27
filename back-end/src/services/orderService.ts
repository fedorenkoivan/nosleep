import { prisma } from '../lib/prisma.js';

interface Jurisdiction {
  name: string;
  level: 'city' | 'county';
}

interface TaxCalculationResult {
  compositeRate: number;
  state_tax: number;
  county_tax: number;
  city_tax: number;
  special_tax: number;
  tax_amount: number;
  total_amount: number;
  appliedLevel: string;
  appliedName: string;
  cityName: string | null;
  countyName: string | null;
}

export async function getTaxJurisdiction(lng: number, lat: number): Promise<Jurisdiction[]> {
  const jurisdictions = await prisma.$queryRaw<Jurisdiction[]>`
    SELECT name, 'city' as level FROM ny_cities 
    WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
    UNION ALL
    SELECT name, 'county' as level FROM ny_counties 
    WHERE ST_Contains(geom, ST_SetSRID(ST_Point(${lng}, ${lat}), 4326))
  `;
  return jurisdictions;
}

export async function calculateTax(
  amount: number,
  lng: number,
  lat: number
): Promise<TaxCalculationResult> {
  const jurisdictions = await getTaxJurisdiction(lng, lat);
  
  if (jurisdictions.length === 0) {
    throw new Error('Координати поза межами штату Нью-Йорк');
  }

  const city = jurisdictions.find(j => j.level === 'city');
  const county = jurisdictions.find(j => j.level === 'county');
  
  let compositeRate: number;
  let appliedLevel: string;
  let appliedName: string;
  let cityRate: number = 0;
  let countyRate: number = 0;
  let citySpecialRate: number = 0;
  let countySpecialRate: number = 0;
  
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
      countySpecialRate = Number(countyTaxData.special_rate);
    }
  }
  
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
      citySpecialRate = Number(cityTaxData.special_rate);
      compositeRate = cityRate;
      appliedLevel = 'City';
      appliedName = cityTaxData.city;
    } else if (countyRate > 0) {
      compositeRate = countyRate;
      appliedLevel = 'County';
      appliedName = county!.name;
    } else {
      throw new Error(`Податкова ставка не знайдена для ${city.name}`);
    }
  } else if (countyRate > 0) {
    compositeRate = countyRate;
    appliedLevel = 'County';
    appliedName = county!.name;
  } else {
    throw new Error('Не вдалося визначити податкову ставку');
  }

  const compositeRateDecimal = compositeRate / 100;
  const state_rate = 0.04;
  const local_rate = compositeRateDecimal - state_rate;
  
  const special_rate = (appliedLevel === 'City' ? citySpecialRate : countySpecialRate) / 100;
  
  let city_rate_component = 0;
  let county_rate_component = 0;
  
  if (appliedLevel === 'City' && cityRate > 0) {
    if (countyRate > 0) {
      county_rate_component = (countyRate - 4) / 100;
      city_rate_component = local_rate - county_rate_component - special_rate;
      if (city_rate_component < 0) city_rate_component = 0;
    } else {
      city_rate_component = local_rate - special_rate;
    }
  } else {
    county_rate_component = local_rate - special_rate;
  }
  
  const tax_amount = amount * compositeRateDecimal;
  const total_amount = amount + tax_amount;
  
  const state_tax = amount * state_rate;
  const county_tax = amount * county_rate_component;
  const city_tax = amount * city_rate_component;
  const special_tax = amount * special_rate;

  return {
    compositeRate,
    state_tax: parseFloat(state_tax.toFixed(2)),
    county_tax: parseFloat(county_tax.toFixed(2)),
    city_tax: parseFloat(city_tax.toFixed(2)),
    special_tax: parseFloat(special_tax.toFixed(2)),
    tax_amount: parseFloat(tax_amount.toFixed(2)),
    total_amount: parseFloat(total_amount.toFixed(2)),
    appliedLevel,
    appliedName,
    cityName: city?.name || null,
    countyName: county?.name || null
  };
}

export async function createOrder(data: {
  user_id: number;
  subtotal: number;
  longitude: number;
  latitude: number;
}) {
  const taxResult = await calculateTax(data.subtotal, data.longitude, data.latitude);
  
  const order = await prisma.order.create({
    data: {
      user_id: data.user_id,
      subtotal: data.subtotal,
      longitude: data.longitude,
      latitude: data.latitude,
      tax_rate: taxResult.compositeRate / 100,
      state_tax: taxResult.state_tax,
      county_tax: taxResult.county_tax,
      city_tax: taxResult.city_tax,
      special_tax: taxResult.special_tax,
      tax_amount: taxResult.tax_amount,
      total_amount: taxResult.total_amount,
      applied_jurisdiction: taxResult.appliedName,
      jurisdiction_level: taxResult.appliedLevel,
      county_name: taxResult.countyName,
      city_name: taxResult.cityName,
      status: 'pending'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  
  return order;
}

export async function getOrders(params: {
  page?: number;
  limit?: number;
  user_id?: number;
  status?: string;
  from_date?: Date;
  to_date?: Date;
}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;
  
  const where: any = {};
  
  if (params.user_id) {
    where.user_id = params.user_id;
  }
  
  if (params.status) {
    where.status = params.status;
  }
  
  if (params.from_date || params.to_date) {
    where.created_at = {};
    if (params.from_date) {
      where.created_at.gte = params.from_date;
    }
    if (params.to_date) {
      where.created_at.lte = params.to_date;
    }
  }
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    }),
    prisma.order.count({ where })
  ]);
  
  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };
}
