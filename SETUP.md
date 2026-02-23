Prerequisites:
Postgresql 17+ and postgis extension

1. Import Shapefile .zip from [here](https://gis.ny.gov/civil-boundaries)
2. Unzip it, drag & drop to repo folder
3. Create postgres table `no_sleep`
4. Populate db using `populate_db.sh`