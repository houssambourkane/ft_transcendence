/*
  Warnings:

  - You are about to drop the column `id_user_owner` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_id_user_owner_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "id_user_owner",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "RoomUser" ADD COLUMN     "owner" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "admin" SET DEFAULT false,
ALTER COLUMN "ban" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
