-- CreateTable
CREATE TABLE "Counties_Tax" (
    "id" SERIAL NOT NULL,
    "county" TEXT NOT NULL,
    "tax_rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Counties_Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
