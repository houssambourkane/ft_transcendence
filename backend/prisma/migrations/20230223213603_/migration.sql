-- DropIndex
DROP INDEX "RoomUser_room_id_key";

-- AlterTable
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("user_id", "room_id");
