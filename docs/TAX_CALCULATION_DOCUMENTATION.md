# Tax Calculation System Documentation

## Overview

This system calculates sales tax for New York State based on geographic coordinates (latitude/longitude) and transaction amount. It implements the tax rules according to NY Publication 718, including state, county, city, and special district taxes (like MCTD).

## How Tax Calculation Works

### 1. Geographic Tax Jurisdiction

New York State has a hierarchical tax structure:

- **State Tax**: 4% (fixed for all of NY State)
- **County Tax**: Varies by county (typically 3-4.75%)
- **City Tax**: Only applies in certain cities (e.g., NYC has 4.5%)
- **Special Taxes**: Metropolitan Commuter Transportation District (MCTD) adds 0.375% in certain areas

### 2. Jurisdiction Priority

The system determines which tax rate to apply based on geographic location:

1. **If coordinates fall within a City boundary** with a special tax rate → Use City rate
2. **Otherwise** → Use County rate
3. **State rate** (4%) is always applied

### 3. Tax Calculation Formula

```
Total Tax = State Tax + Local Tax + Special Tax

Where:
- State Tax = Subtotal × 4%
- Local Tax = Subtotal × (County/City Rate - 4%)
- Special Tax = Subtotal × MCTD Rate (if applicable)
```

## System Architecture

### Database Schema

#### Geospatial Tables (PostGIS)
- `ny_counties` - County boundaries with geometry data
- `ny_cities` - City boundaries with geometry data
- `towns`, `villages` - Additional geographic divisions

#### Tax Configuration Tables
- `county_tax` - Tax rates for each county
  - `county` (VARCHAR) - County name
  - `tax` (DECIMAL) - Total tax rate (%)
  - `special_rate` (DECIMAL) - MCTD or other special rates (%)

- `city_tax` - Tax rates for cities with special rates
  - `city` (VARCHAR) - City name
  - `tax` (DECIMAL) - Total tax rate (%)
  - `special_rate` (DECIMAL) - Special district rates (%)

#### Transaction Tables
- `Order` - Stores all tax calculations and order details
  - Geographic data (latitude, longitude)
  - Financial data (subtotal, taxes, total)
  - Jurisdiction information (applied location)
  - Timestamps and status

### API Endpoints

#### 1. POST `/calculate-tax`
Calculate tax without creating an order.

**Request:**
```json
{
  "subtotal": 100.00,
  "longitude": -73.9857,
  "latitude": 40.7484
}
```

**Response:**
```json
{
  "subtotal": 100.00,
  "tax_amount": 8.88,
  "total_amount": 108.88,
  "tax_breakdown": {
    "composite_tax_rate": "8.875%",
    "state_rate": "4.000%",
    "state_tax": 4.00,
    "county_rate": "4.500%",
    "county_tax": 4.50,
    "city_rate": "0.000%",
    "city_tax": 0.00,
    "special_rates": "0.375%",
    "special_tax": 0.38
  },
  "jurisdictions": {
    "applied_level": "County",
    "applied_name": "New York",
    "city": "New York",
    "county": "New York"
  },
  "location": {
    "coordinates": {
      "longitude": -73.9857,
      "latitude": 40.7484
    }
  }
}
```

#### 2. GET `/location`
Get geographic information for coordinates.

**Request:**
```
GET /location?longitude=-73.9857&latitude=40.7484
```

**Response:**
```json
{
  "coordinates": {
    "longitude": -73.9857,
    "latitude": 40.7484
  },
  "county": {
    "name": "New York",
    "abbrev": "NEWY",
    "fips_code": "36061",
    "pop2020": 1694251
  },
  "city": {
    "name": "New York",
    "muni_type": "city",
    "county": "New York, Bronx, Kings, Richmond, Queens",
    "pop2020": 8804190
  }
}
```

#### 3. POST `/orders`
Create a new order with tax calculation.

**Request:**
```json
{
  "user_id": 1,
  "subtotal": 150.00,
  "longitude": -73.9857,
  "latitude": 40.7484
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "user_id": 1,
    "subtotal": "150.00",
    "tax_rate": "0.08875",
    "state_tax": "6.00",
    "county_tax": "6.75",
    "city_tax": "0.00",
    "special_tax": "0.56",
    "tax_amount": "13.31",
    "total_amount": "163.31",
    "applied_jurisdiction": "New York",
    "jurisdiction_level": "County",
    "status": "pending",
    "created_at": "2026-02-27T08:15:17.943Z"
  }
}
```

#### 4. GET `/orders`
List orders with pagination and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `user_id` - Filter by user
- `status` - Filter by status
- `from_date` - Filter from date
- `to_date` - Filter to date

## Processing Flow

### Step-by-Step Calculation Process

1. **Receive Request**
   - Frontend sends: `{subtotal, longitude, latitude}`
   - Backend validates input

2. **Determine Jurisdiction**
   ```sql
   -- Query to find which geographic area contains the point
   SELECT name, 'city' as level FROM ny_cities 
   WHERE ST_Contains(geom, ST_SetSRID(ST_Point(lng, lat), 4326))
   UNION ALL
   SELECT name, 'county' as level FROM ny_counties 
   WHERE ST_Contains(geom, ST_SetSRID(ST_Point(lng, lat), 4326))
   ```
   - Uses PostGIS `ST_Contains` function
   - Returns city and/or county that contains the point

3. **Fetch Tax Rates**
   - Priority: Check City tax first
   - Fallback: Use County tax
   - Query `city_tax` or `county_tax` tables

4. **Calculate Tax Components**
   ```javascript
   const state_rate = 0.04; // 4% fixed
   const composite_rate = tax_rate / 100; // e.g., 8.875 → 0.08875
   const local_rate = composite_rate - state_rate;
   
   // Special rate handling (MCTD)
   const special_rate = special_rate_from_db / 100;
   
   // Calculate dollar amounts
   const state_tax = subtotal * state_rate;
   const local_tax = subtotal * local_rate;
   const special_tax = subtotal * special_rate;
   const tax_amount = subtotal * composite_rate;
   const total = subtotal + tax_amount;
   ```

5. **Store Order (if creating)**
   - Save all calculated values to `Order` table
   - Include jurisdiction information
   - Set status to "pending"

6. **Return Response**
   - Format breakdown with percentages and dollar amounts
   - Include jurisdiction details
   - Return location coordinates

## PostGIS Spatial Queries

### Key Concepts

**SRID 4326**: World Geodetic System 1984 (WGS84)
- Standard coordinate system for GPS
- Longitude: -180 to 180 (East/West)
- Latitude: -90 to 90 (North/South)

**ST_Point(longitude, latitude)**
- Creates a point geometry from coordinates

**ST_SetSRID(geometry, srid)**
- Sets the Spatial Reference System Identifier
- Required for spatial operations

**ST_Contains(geometry1, geometry2)**
- Returns true if geometry1 completely contains geometry2
- Used to check if a point is inside a polygon (county/city boundary)

### Example Query

```sql
-- Find if point is in New York County
SELECT name FROM ny_counties 
WHERE ST_Contains(
  geom,                              -- County boundary polygon
  ST_SetSRID(                        -- Set coordinate system
    ST_Point(-73.9857, 40.7484),    -- Create point from lat/lon
    4326                             -- WGS84 coordinate system
  )
);
-- Result: "New York"
```

## Tax Rate Examples

### Metropolitan Commuter Transportation District (MCTD)

Counties with MCTD (0.375% additional):
- Bronx, Kings (Brooklyn), New York (Manhattan), Queens, Richmond (Staten Island)
- Nassau, Suffolk
- Dutchess, Orange, Putnam, Rockland, Westchester

### Sample Rates by Location

| Location | State | County | City | MCTD | Total |
|----------|-------|--------|------|------|-------|
| Manhattan | 4.0% | 4.5% | 0% | 0.375% | 8.875% |
| Buffalo (Erie) | 4.0% | 4.75% | 0% | 0% | 8.75% |
| Albany | 4.0% | 4.0% | 0% | 0% | 8.0% |
| Yonkers | 4.0% | 4.0% | 0.5% | 0.375% | 8.875% |

## Frontend Integration

### React Component Flow

1. **User Input** (`ManualOrder.tsx`)
   - Form fields: latitude, longitude, subtotal
   - Auto-debounce (500ms delay)

2. **API Calls** (via `api/client.ts`)
   - `getLocation()` - Display location info
   - `calculateTax()` - Live tax calculation
   - `orders.create()` - Submit order

3. **Live Updates**
   - Shows location: "Albany, Albany County, NY"
   - Displays tax breakdown in real-time
   - Calculates total automatically

4. **Order Creation**
   - Validates all fields
   - Creates order in database
   - Shows success message
   - Auto-clears form after 3 seconds

## Error Handling

### Common Errors

1. **"Coordinates outside New York State"**
   - Point doesn't intersect with any NY county
   - Check longitude/latitude values

2. **"Tax rate not found for [location]"**
   - Missing entry in `county_tax` or `city_tax`
   - Need to seed tax data

3. **"User not found"**
   - Invalid user_id in order creation
   - Check if user exists in database

## Performance Considerations

### Database Indexes

```sql
-- Spatial indexes on geometry columns
CREATE INDEX ON ny_counties USING GIST (geom);
CREATE INDEX ON ny_cities USING GIST (geom);

-- Regular indexes for lookups
CREATE INDEX ON county_tax (county);
CREATE INDEX ON city_tax (city);
CREATE INDEX ON orders (user_id);
CREATE INDEX ON orders (created_at);
```

### Optimization Tips

1. **Spatial queries are fast** due to GIST indexes
2. **Debounce frontend** to reduce API calls
3. **Cache tax rates** in application memory (optional)
4. **Use connection pooling** for database

## Testing

### Test Coordinates

```javascript
// Manhattan, NY (NYC - highest rate)
{ latitude: 40.7484, longitude: -73.9857 }
// Expected: 8.875% (4% + 4.5% + 0.375%)

// Buffalo, Erie County
{ latitude: 42.8864, longitude: -78.8784 }
// Expected: 8.75% (4% + 4.75%)

// Albany
{ latitude: 42.6526, longitude: -73.7562 }
// Expected: 8.0% (4% + 4%)

// Cattaraugus County
{ latitude: 42.01246326, longitude: -78.86718664 }
// Expected: 8.0% (4% + 4%)
```

## References

- [NY Publication 718](https://www.tax.ny.gov/pubs_and_bulls/publications/sales/pub718.htm) - Official NY State Sales Tax Guide
- [PostGIS Documentation](https://postgis.net/docs/) - Spatial database functions
- [WGS84 / EPSG:4326](https://epsg.io/4326) - Coordinate reference system
