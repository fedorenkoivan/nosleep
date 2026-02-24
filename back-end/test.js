import { Client } from 'pg';

const client = new Client({
  connectionString: "",
});

async function checkTax() {
  await client.connect();
  
  const res = await client.query(`
    SELECT name 
    FROM ny_counties
    LIMIT 10; 
  `);

  console.log(res.rows);
  // console.log(process.env.DATABASE_URL); // TODO: parse db url from env
  await client.end();
}

checkTax();