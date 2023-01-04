-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "receipt_link" TEXT NOT NULL,
    "transaction_id" INTEGER NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "member_bank_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
