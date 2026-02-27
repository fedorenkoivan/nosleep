Prerequisites:
Postgresql 17+ and postgis extension

1. Import Shapefile .zip from [here](https://gis.ny.gov/civil-boundaries)
2. Unzip it, drag & drop to root repo folder
3. Create postgres table `no_sleep`
4. Populate db:

`shp2pgsql -s 4326 -I Cities_Towns.shp public.ny_cities_towns | psql -d no_sleep`
`shp2pgsql -s 4326 -I Cities.shp public.ny_cities | psql -d no_sleep`
`shp2pgsql -s 4326 -I Counties_Shoreline.shp public.ny_cities_shoreline | psql -d no_sleep`  
`shp2pgsql -s 4326 -I Counties.shp public.ny_counties | psql -d no_sleep`
`shp2pgsql -s 4326 -I Indian_Territories.shp public.indian_territories | psql -d no_sleep`
`shp2pgsql -s 4326 -I State_shoreline.shp public.state_shoreline | psql -d no_sleep`
`shp2pgsql -s 4326 -I State.shp public.state | psql -d no_sleep`
`shp2pgsql -s 4326 -I Towns.shp public.towns | psql -d no_sleep`
`shp2pgsql -s 4326 -I Villages.shp public.villages | psql -d no_sleep`

curl -s -X POST http://localhost:3000/o
rders \
>   -H "Content-Type: application/json" \
>   -d '{
quote>     "user_id": 1,
quote>     "subtotal": 150.00,
quote>     "longitude": -73.9857,
quote>     "latitude": 40.7484
quote>   }' | jq .
{
  "message": "Замовлення успішно створено",
  "order": {
    "id": 1,
    "user_id": 1,
    "subtotal": "150",
    "longitude": "-73.9857",
    "latitude": "40.7484",
    "tax_rate": "0.08875",
    "state_tax": "6",
    "county_tax": "6.75",
    "city_tax": "0",
    "special_tax": "0.56",
    "tax_amount": "13.31",
    "total_amount": "163.31",
    "applied_jurisdiction": "New York",
    "jurisdiction_level": "County",
    "county_name": "New York",
    "city_name": "New York",
    "status": "pending",
    "created_at": "2026-02-27T08:15:17.943Z",
    "updated_at": "2026-02-27T08:15:17.943Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}