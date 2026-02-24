import { prisma } from "./lib/prisma";

async function main() {
    const counties = await prisma.counties_Tax.create({
        data: {
            county: "Oregon",
            tax_rate: 6.6
        }
    })
    console.log("Counties:", counties)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });