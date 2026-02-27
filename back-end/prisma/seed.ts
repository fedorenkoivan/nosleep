import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MCTD_SPECIAL_RATE = 0.375

// NewYork (Manhattan) - to consider how to calculate
const countyTaxRates = [
  { county: "Albany", tax: 8.0 },
  { county: "Allegany", tax: 8.5 },
  { county: "Bronx", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Brooklyn", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Broome", tax: 8.0 },
  { county: "Cattaraugus", tax: 8.0 },
  { county: "Cayuga", tax: 8.0 },
  { county: "Chautauqua", tax: 8.0 },
  { county: "Chemung", tax: 8.0 },
  { county: "Chenango", tax: 8.0 },
  { county: "Clinton", tax: 8.0 },
  { county: "Columbia", tax: 8.0 },
  { county: "Cortland", tax: 8.0 },
  { county: "Delaware", tax: 8.0 },
  { county: "Dutchess", tax: 8.125, special_rate: MCTD_SPECIAL_RATE },
  { county: "Erie", tax: 8.75 },
  { county: "Essex", tax: 8.0 },
  { county: "Franklin", tax: 8.0 },
  { county: "Fulton", tax: 8.0 },
  { county: "Genesee", tax: 8.0 },
  { county: "Greene", tax: 8.0 },
  { county: "Hamilton", tax: 8.0 },
  { county: "Herkimer", tax: 8.25 },
  { county: "Jefferson", tax: 8.0 },
  { county: "Kings", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Manhattan", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Lewis", tax: 8.0 },
  { county: "Livingston", tax: 8.0 },
  { county: "Madison", tax: 8.0 },
  { county: "Monroe", tax: 8.0 },
  { county: "Montgomery", tax: 8.0 },
  { county: "Nassau", tax: 8.625, special_rate: MCTD_SPECIAL_RATE },
  { county: "New York", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Niagara", tax: 8.0 },
  { county: "Oneida", tax: 8.75 },
  { county: "Onondaga", tax: 8.0 },
  { county: "Ontario", tax: 7.5 },
  { county: "Orange", tax: 8.125, special_rate: MCTD_SPECIAL_RATE },
  { county: "Orleans", tax: 8.0 },
  { county: "Oswego", tax: 8.0 },
  { county: "Otsego", tax: 8.0 },
  { county: "Putnam", tax: 8.375, special_rate: MCTD_SPECIAL_RATE },
  { county: "Queens", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Rensselaer", tax: 8.0 },
  { county: "Richmond", tax: 8.875, special_rate: MCTD_SPECIAL_RATE },
  { county: "Rockland", tax: 8.375, special_rate: MCTD_SPECIAL_RATE },
  // { county: "Staten Island", tax: 8.375, special_rate: MCTD_SPECIAL_RATE },
  { county: "St. Lawrence", tax: 8.0 },
  { county: "Saratoga", tax: 7.0 },
  { county: "Schenectady", tax: 8.0 },
  { county: "Schoharie", tax: 8.0 },
  { county: "Schuyler", tax: 8.0 },
  { county: "Seneca", tax: 8.0 },
  { county: "Steuben", tax: 8.0 },
  { county: "Suffolk", tax: 8.75, special_rate: MCTD_SPECIAL_RATE },
  { county: "Sullivan", tax: 8.0 },
  { county: "Tioga", tax: 8.0 },
  { county: "Tompkins", tax: 8.0 },
  { county: "Ulster", tax: 8.0 },
  { county: "Warren", tax: 7.0 },
  { county: "Washington", tax: 7.0 },
  { county: "Wayne", tax: 8.0 },
  { county: "Westchester", tax: 8.375, special_rate: MCTD_SPECIAL_RATE },
  { county: "Wyoming", tax: 8.0 },
  { county: "Yates", tax: 8.0 },
];

// Cities with different reporting codes from their county (per pub718)
const cityTaxRates = [
  { city: "Olean", tax: 8.0 }, // Cattaraugus
  { city: "Salamanca", tax: 8.0 }, // Cattaraugus
  { city: "Auburn", tax: 8.0 }, // Cayuga
  { city: "Norwich", tax: 8.0 }, // Chenango
  { city: "Gloversville", tax: 8.0 }, // Fulton
  { city: "Johnstown", tax: 8.0 }, // Fulton
  { city: "Oneida", tax: 8.0 }, // Madison
  { city: "Rome", tax: 8.75 }, // Oneida
  { city: "Utica", tax: 8.75 }, // Oneida
  { city: "Oswego", tax: 8.0 }, // Oswego county
  { city: "Ogdensburg", tax: 8.0 }, // St. Lawrence
  { city: "Saratoga Springs", tax: 7.0 }, // Saratoga
  { city: "Ithaca", tax: 8.0 }, // Tompkins
  { city: "Glens Falls", tax: 7.0 }, // Warren
  { city: "Mount Vernon", tax: 8.375, special_rate: MCTD_SPECIAL_RATE }, // Westchester
  { city: "New Rochelle", tax: 8.375, special_rate: MCTD_SPECIAL_RATE }, // Westchester
  { city: "White Plains", tax: 8.375, special_rate: MCTD_SPECIAL_RATE }, // Westchester
  { city: "Yonkers", tax: 8.875, special_rate: MCTD_SPECIAL_RATE }, // Westchester — different tax!
];

async function main() {
  console.log("Seeding county_tax table...");
  await prisma.county_tax.deleteMany();
  const countyResult = await prisma.county_tax.createMany({
    data: countyTaxRates,
  });
  console.log(`Seeded ${countyResult.count} county tax records.`);

  console.log("Seeding city_tax table...");
  await prisma.city_tax.deleteMany();
  const cityResult = await prisma.city_tax.createMany({
    data: cityTaxRates,
  });
  console.log(`Seeded ${cityResult.count} city tax records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });