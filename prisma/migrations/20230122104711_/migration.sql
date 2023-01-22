/*
  Warnings:

  - The `gender` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT;

-- DropEnum
DROP TYPE "GENDER";
