-- CreateTable
CREATE TABLE "city_tax" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR(40) NOT NULL,
    "tax" DECIMAL NOT NULL,

    CONSTRAINT "city_tax_pkey" PRIMARY KEY ("id")
);
