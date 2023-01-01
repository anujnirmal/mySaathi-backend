-- AlterTable
ALTER TABLE "members" ALTER COLUMN "pincode" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ycf_id_counter" (
    "id" SERIAL NOT NULL,
    "last_ycf_id" TEXT NOT NULL,

    CONSTRAINT "ycf_id_counter_pkey" PRIMARY KEY ("id")
);
