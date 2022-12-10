/*
  Warnings:

  - Added the required column `expiryDate` to the `dashboard_users` table without a default value. This is not possible if the table is not empty.
  - Made the column `token` on table `dashboard_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "expiryDate",
ADD COLUMN     "expiryDate" INTEGER NOT NULL,
ALTER COLUMN "token" SET NOT NULL;
