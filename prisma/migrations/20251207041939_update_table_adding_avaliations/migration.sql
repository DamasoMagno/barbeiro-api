/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `SchedulePeriod` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ScheduleWeek` table. All the data in the column will be lost.
  - Added the required column `model` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayOfWeek` to the `ScheduleWeek` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScheduleModel" AS ENUM ('WEEK', 'CUSTOM', 'UNAVAILABLE');

-- DropForeignKey
ALTER TABLE "SchedulePeriod" DROP CONSTRAINT "SchedulePeriod_scheduleId_fkey";

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "model" "ScheduleModel" NOT NULL;

-- AlterTable
ALTER TABLE "SchedulePeriod" DROP COLUMN "scheduleId",
ADD COLUMN     "scheduleCustomId" INTEGER,
ADD COLUMN     "scheduleWeekId" INTEGER;

-- AlterTable
ALTER TABLE "ScheduleWeek" DROP COLUMN "date",
ADD COLUMN     "dayOfWeek" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Avaliations" (
    "id" SERIAL NOT NULL,
    "barberShopId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avaliations" ADD CONSTRAINT "Avaliations_barberShopId_fkey" FOREIGN KEY ("barberShopId") REFERENCES "BarberShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulePeriod" ADD CONSTRAINT "SchedulePeriod_scheduleWeekId_fkey" FOREIGN KEY ("scheduleWeekId") REFERENCES "ScheduleWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulePeriod" ADD CONSTRAINT "SchedulePeriod_scheduleCustomId_fkey" FOREIGN KEY ("scheduleCustomId") REFERENCES "ScheduleCustom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
