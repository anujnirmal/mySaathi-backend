/*
  Warnings:

  - You are about to drop the column `bank_account_numbr` on the `bank_details` table. All the data in the column will be lost.
  - Added the required column `bank_account_number` to the `bank_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_details" DROP COLUMN "bank_account_numbr",
ADD COLUMN     "bank_account_number" VARCHAR(255) NOT NULL;
