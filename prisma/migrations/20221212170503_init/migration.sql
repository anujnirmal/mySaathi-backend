/*
  Warnings:

  - The `expiry_at` column on the `dashboard_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "expiry_at",
ADD COLUMN     "expiry_at" TIMESTAMP(3);
