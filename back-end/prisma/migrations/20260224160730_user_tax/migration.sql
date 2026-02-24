-- CreateTable
CREATE TABLE "county_tax" (
    "id" SERIAL NOT NULL,
    "county" VARCHAR(40) NOT NULL,
    "tax" DECIMAL NOT NULL,

    CONSTRAINT "county_tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "password" VARCHAR(40) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
