-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "indian_territories" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "county" VARCHAR(50),
    "gnis_id" VARCHAR(9),
    "aia_code" VARCHAR(4),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "indian_territories_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "ny_cities" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "muni_type" VARCHAR(4),
    "munitycode" INTEGER,
    "county" VARCHAR(50),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(10),
    "swis" VARCHAR(6),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "map_symbol" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "ny_cities_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "ny_cities_shoreline" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "abbrev" VARCHAR(4),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(5),
    "swis" VARCHAR(6),
    "nysp_zone" VARCHAR(11),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "nyc" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "ny_cities_shoreline_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "ny_cities_towns" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "muni_type" VARCHAR(4),
    "munitycode" INTEGER,
    "county" VARCHAR(50),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(10),
    "swis" VARCHAR(6),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "map_symbol" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "ny_cities_towns_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "ny_counties" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "abbrev" VARCHAR(4),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(5),
    "swis" VARCHAR(6),
    "nysp_zone" VARCHAR(11),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "nyc" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "ny_counties_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "state" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "abbrev" VARCHAR(2),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(2),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "state_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "state_shoreline" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(50),
    "abbrev" VARCHAR(2),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(2),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "state_shoreline_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "towns" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "muni_type" VARCHAR(4),
    "munitycode" INTEGER,
    "county" VARCHAR(50),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(10),
    "swis" VARCHAR(6),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "map_symbol" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "towns_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "villages" (
    "gid" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "town" VARCHAR(50),
    "county" VARCHAR(50),
    "gnis_id" VARCHAR(9),
    "fips_code" VARCHAR(15),
    "swis" VARCHAR(6),
    "pop1990" DOUBLE PRECISION,
    "pop2000" DOUBLE PRECISION,
    "pop2010" DOUBLE PRECISION,
    "pop2020" DOUBLE PRECISION,
    "dos_ll" VARCHAR(7),
    "dosll_date" DATE,
    "map_symbol" VARCHAR(1),
    "calc_sq_mi" DECIMAL,
    "datemod" DATE,
    "shape_leng" DECIMAL,
    "shape_area" DECIMAL,
    "geom" geometry,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("gid")
);

-- CreateIndex
CREATE INDEX "indian_territories_geom_idx" ON "indian_territories" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "ny_cities_geom_idx" ON "ny_cities" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "ny_cities_shoreline_geom_idx" ON "ny_cities_shoreline" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "ny_cities_towns_geom_idx" ON "ny_cities_towns" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "ny_counties_geom_idx" ON "ny_counties" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "state_geom_idx" ON "state" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "state_shoreline_geom_idx" ON "state_shoreline" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "towns_geom_idx" ON "towns" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "villages_geom_idx" ON "villages" USING GIST ("geom");

