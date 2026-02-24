import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkTax() {
  await client.connect();
  
  const res = await client.query(`
    SELECT name 
    FROM ny_counties
    LIMIT 10; 
  `);

  console.log(res.rows);
  await client.end();
}

checkTax();