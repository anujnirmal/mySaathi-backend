/*
  Warnings:

  - The `role` column on the `dashboard_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `token` on table `dashboard_users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `expiryDate` to the `dashboard_users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DASHBOARD_ROLES" AS ENUM ('SUPERADMIN', 'ADMIN');

-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "role",
ADD COLUMN     "role" "DASHBOARD_ROLES" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "token" SET NOT NULL,
DROP COLUMN "expiryDate",
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL;
