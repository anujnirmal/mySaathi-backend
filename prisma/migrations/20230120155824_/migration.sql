-- CreateTable
CREATE TABLE "seeding_data" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "admin_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "admin_id" INTEGER NOT NULL,

    CONSTRAINT "seeding_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seeding_data" ADD CONSTRAINT "seeding_data_id_fkey" FOREIGN KEY ("id") REFERENCES "dashboard_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
