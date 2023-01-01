-- CreateTable
CREATE TABLE "bank_details" (
    "id" SERIAL NOT NULL,
    "bank_name" VARCHAR(255) NOT NULL,
    "bank_acount_numbr" TEXT NOT NULL,
    "ifsc_code" BIGINT NOT NULL,
    "bank_branch_name" BIGINT NOT NULL,
    "pancard_number" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "trashed" BOOLEAN,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "longitute" TEXT NOT NULL,
    "latitute" TEXT NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "longitute" TEXT NOT NULL,
    "latitute" TEXT NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_bank_name_key" ON "bank_details"("bank_name");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_ifsc_code_key" ON "bank_details"("ifsc_code");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_bank_branch_name_key" ON "bank_details"("bank_branch_name");

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_pancard_number_key" ON "bank_details"("pancard_number");
