-- DropIndex
DROP INDEX "members_aadhaar_number_key";

-- DropIndex
DROP INDEX "members_pancard_number_key";

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "pancard_number" SET DATA TYPE TEXT;
