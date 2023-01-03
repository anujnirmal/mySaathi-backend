-- CreateEnum
CREATE TYPE "TRANSACTION_STATUS" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "balance_amount" TEXT,
ADD COLUMN     "yearly_quota" TEXT;

-- CreateTable
CREATE TABLE "member_bank_transaction" (
    "id" SERIAL NOT NULL,
    "amount_requested" BIGINT NOT NULL,
    "status" "TRANSACTION_STATUS" NOT NULL DEFAULT 'PENDING',
    "transaction_date" TIMESTAMP(3),
    "admin_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,

    CONSTRAINT "member_bank_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_bank_transaction" ADD CONSTRAINT "member_bank_transaction_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "dashboard_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_bank_transaction" ADD CONSTRAINT "member_bank_transaction_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
