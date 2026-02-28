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