/*
  Warnings:

  - Changed the type of `expiry_at` on the `refresh_tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "expiry_at",
ADD COLUMN     "expiry_at" TIMESTAMP(3) NOT NULL;
