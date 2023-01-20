/*
  Warnings:

  - The values [MEDICAL] on the enum `MODULES_ACCESS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MODULES_ACCESS_new" AS ENUM ('EDUCATION', 'HEALTH', 'HOUSEHOLD');
ALTER TABLE "members" ALTER COLUMN "modules" TYPE "MODULES_ACCESS_new"[] USING ("modules"::text::"MODULES_ACCESS_new"[]);
ALTER TABLE "member_bank_transaction" ALTER COLUMN "module" TYPE "MODULES_ACCESS_new" USING ("module"::text::"MODULES_ACCESS_new");
ALTER TYPE "MODULES_ACCESS" RENAME TO "MODULES_ACCESS_old";
ALTER TYPE "MODULES_ACCESS_new" RENAME TO "MODULES_ACCESS";
DROP TYPE "MODULES_ACCESS_old";
COMMIT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "ycf_id" DROP NOT NULL;
