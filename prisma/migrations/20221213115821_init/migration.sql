/*
  Warnings:

  - A unique constraint covering the columns `[device_id]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "device_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_device_id_key" ON "refresh_tokens"("device_id");
