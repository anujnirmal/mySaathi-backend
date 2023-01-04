-- DropForeignKey
ALTER TABLE "member_bank_transaction" DROP CONSTRAINT "member_bank_transaction_admin_id_fkey";

-- AlterTable
ALTER TABLE "member_bank_transaction" ALTER COLUMN "admin_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "member_bank_transaction" ADD CONSTRAINT "member_bank_transaction_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "dashboard_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
