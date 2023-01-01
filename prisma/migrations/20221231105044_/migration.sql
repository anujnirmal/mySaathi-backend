/*
  Warnings:

  - The values [INSURANCE] on the enum `MODULES_ACCESS` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `pancard_number` on the `bank_details` table. All the data in the column will be lost.
  - You are about to drop the column `trashed` on the `bank_details` table. All the data in the column will be lost.
  - You are about to alter the column `bank_acount_numbr` on the `bank_details` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `member_id` to the `bank_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MODULES_ACCESS_new" AS ENUM ('EDUCATION', 'MEDICAL', 'HOUSEHOLD');
ALTER TABLE "members" ALTER COLUMN "modules" TYPE "MODULES_ACCESS_new"[] USING ("modules"::text::"MODULES_ACCESS_new"[]);
ALTER TYPE "MODULES_ACCESS" RENAME TO "MODULES_ACCESS_old";
ALTER TYPE "MODULES_ACCESS_new" RENAME TO "MODULES_ACCESS";
DROP TYPE "MODULES_ACCESS_old";
COMMIT;

-- DropIndex
DROP INDEX "bank_details_bank_branch_name_key";

-- DropIndex
DROP INDEX "bank_details_bank_name_key";

-- DropIndex
DROP INDEX "bank_details_ifsc_code_key";

-- DropIndex
DROP INDEX "bank_details_pancard_number_key";

-- AlterTable
ALTER TABLE "bank_details" DROP COLUMN "address",
DROP COLUMN "pancard_number",
DROP COLUMN "trashed",
ADD COLUMN     "member_id" INTEGER NOT NULL,
ALTER COLUMN "bank_acount_numbr" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "ifsc_code" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "bank_branch_name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "news" ALTER COLUMN "body" DROP NOT NULL;

-- CreateTable
CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "child_name" TEXT NOT NULL,
    "school_college_name" TEXT NOT NULL,
    "standard_grade" TEXT NOT NULL,
    "member_id" INTEGER NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
