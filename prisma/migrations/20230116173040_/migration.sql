-- CreateEnum
CREATE TYPE "LANGUAGE" AS ENUM ('ENGLISH', 'HINDI', 'MARATHI');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "language" "LANGUAGE";
