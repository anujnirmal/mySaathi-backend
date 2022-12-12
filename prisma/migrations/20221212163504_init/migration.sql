/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `dashboard_users` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `expiry_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "expiryDate",
ADD COLUMN     "expiry_at" BIGINT;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "expiry_date",
ADD COLUMN     "expiry_at" BIGINT NOT NULL;
