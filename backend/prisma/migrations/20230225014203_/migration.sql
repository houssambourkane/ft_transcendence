/*
  Warnings:

  - The `type` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'public';
