-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "alternate_mobile_number" TEXT,
ADD COLUMN     "date_of_birth" TEXT,
ADD COLUMN     "gender" "GENDER";

-- CreateTable
CREATE TABLE "member_other_details" (
    "id" SERIAL NOT NULL,
    "registered_member_of_film_union" BOOLEAN NOT NULL,
    "active_saathi_member_till_2022" BOOLEAN NOT NULL,
    "monthly_salary_range" TEXT NOT NULL,
    "retired_person" BOOLEAN NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "disability" TEXT,
    "member_id" INTEGER NOT NULL,

    CONSTRAINT "member_other_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_other_details" ADD CONSTRAINT "member_other_details_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
