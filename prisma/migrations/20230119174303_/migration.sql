/*
  Warnings:

  - You are about to drop the `member_other_details` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `active_saathi_member_till_2022` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disabled` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthly_salary_range` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registered_member_of_film_union` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retired_person` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "member_other_details" DROP CONSTRAINT "member_other_details_member_id_fkey";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "active_saathi_member_till_2022" BOOLEAN NOT NULL,
ADD COLUMN     "disability" TEXT,
ADD COLUMN     "disabled" BOOLEAN NOT NULL,
ADD COLUMN     "monthly_salary_range" TEXT NOT NULL,
ADD COLUMN     "registered_member_of_film_union" BOOLEAN NOT NULL,
ADD COLUMN     "retired_person" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "member_other_details";
