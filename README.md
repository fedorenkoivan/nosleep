🎀🎀 No Sleep! No Food! No Holidays! 🎀🎀 | Instant Wellness Kits Delivery Admin

<img width="4325" height="808" alt="ourLogooo" src="https://github.com/user-attachments/assets/07813635-f6b9-4894-b87a-b6b2099cfd42" />

**NoSleep** is a high-performance administrative dashboard designed for a drone delivery service operating across New York State. This project addresses a critical business challenge: automating complex Composite Sales Tax calculations based on precise GPS coordinates for Instant Wellness Kits.

**Access the app [here](https://nosleep-iota.vercel.app)**
**Test user:**
**Name: parsival**
**Password: firsttothekey**


## Business Solution: Automated Taxation 🎀

The core value of this application lies in its ability to solve the tax calculation problem within a 48-hour window. Unlike simple flat-rate systems, NoSleep implements a multi-layered taxation logic specific to New York State laws.

### 1. Advanced Geofencing 🎀
Instead of basic coordinate range checks, the system utilizes PostGIS for industry-standard spatial analysis:
* **Spatial Queries**: Each order uses the ST_Contains SQL function to determine if a delivery point falls within specific city (ny_cities) or county (ny_counties) polygons.
* **Strict Validation**: Orders are only accepted if the coordinates are within the legal boundaries of New York State (approx. Latitude 40.5 to 45.0 and Longitude -79.8 to -71.8).

### 2. Composite Tax Calculation Logic 🎀
The backend calculates the final price using a prioritized hierarchy:
* **State Level**: A base 4.000% New York State tax is applied to all orders.
* **Local Priority (City > County)**: If a delivery point is within a city with its own tax jurisdiction (e.g., Yonkers or Saratoga Springs), the city rate is applied. If no city rate exists, the system falls back to the county rate.
* **MCTD Special Rate**: For regions within the Metropolitan Commuter Transportation District (including NYC, Long Island, and Westchester), an additional 0.375% special rate is automatically included in the breakdown.

### 3. Data Integrity 🎀
* All financial values and coordinates are stored using the Decimal type to prevent floating-point rounding errors.
* Every order stores a full tax breakdown: state_tax, county_tax, city_tax, and special_tax.


## Key Features 🎀

* **Authentication & Session Management**: Full login and logout functionality is implemented. The system uses JWT tokens for secure session management and password salting/hashing for data protection.
* **Interactive Map with Manual Entry**: Users can create orders manually by entering a subtotal and selecting a location via an integrated map. The map features built-in boundary restrictions to ensure that only locations within the authorized New York State area can be selected.
* **Bulk CSV Import**: Robust processing of external order data. The system validates each row, calculates taxes via geofencing, and provides a detailed success/failure report.
* **Orders Management**: A comprehensive table featuring pagination, status filters, and a detailed view of applied jurisdictions.


## Technical Stack 🎀

* **Frontend**: React, TypeScript, Tailwind CSS (v4), Lucide Icons.
* **Backend**: Node.js, Express, TypeScript.
* **Database**: PostgreSQL with PostGIS extension.
* **ORM**: Prisma.


## Getting Started 🎀
**To run application in development:**
1. Clone this repository: `git clone https://github.com/fedorenkoivan/nosleep.git`
2. Node is needed. Install it [here](https://nodejs.org/en).
3. Verify that you in fact have node.js: `node --version`
4. Run `docker compose watch` in terminal

Access the UI: http://localhost:5173
Access the server: localhost: http://localhost:3000
