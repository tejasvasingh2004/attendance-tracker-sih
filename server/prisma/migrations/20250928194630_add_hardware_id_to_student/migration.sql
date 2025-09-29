/*
  Warnings:

  - You are about to drop the column `hardwareId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hardwareId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."User_hardwareId_key";

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "hardwareId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "hardwareId",
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_hardwareId_key" ON "public"."Student"("hardwareId");
