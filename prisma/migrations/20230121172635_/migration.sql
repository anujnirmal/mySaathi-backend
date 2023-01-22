-- AlterTable
ALTER TABLE "seeding_data" ADD COLUMN     "dublicate_error_logs" TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "error_logs" DROP NOT NULL;
