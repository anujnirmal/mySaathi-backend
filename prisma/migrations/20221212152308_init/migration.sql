/*
  Warnings:

  - You are about to drop the column `for_all` on the `notifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aadhaar_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pancard_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "for_all";

-- CreateIndex
CREATE UNIQUE INDEX "members_mobile_number_key" ON "members"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "members_aadhaar_number_key" ON "members"("aadhaar_number");

-- CreateIndex
CREATE UNIQUE INDEX "members_pancard_number_key" ON "members"("pancard_number");
