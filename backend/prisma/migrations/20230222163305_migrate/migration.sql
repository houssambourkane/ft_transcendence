/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `Intraid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatar` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loses` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wins` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "Fa_2" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Intraid" INTEGER NOT NULL,
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "loses" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "wins" INTEGER NOT NULL,
ADD COLUMN     "xp" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Friends" (
    "From_id" INTEGER NOT NULL,
    "To_id" INTEGER NOT NULL,
    "Accepted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Gammes" (
    "id" INTEGER NOT NULL,
    "background" TEXT NOT NULL,
    "playerone_id" INTEGER NOT NULL,
    "playertwo_id" INTEGER NOT NULL,
    "playeronescore" INTEGER NOT NULL,
    "plyaertwoscore" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Romms" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'public',
    "id_user_owner" INTEGER NOT NULL,

    CONSTRAINT "Romms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Romms_user" (
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "ban" BOOLEAN NOT NULL,
    "mute" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "room_id" INTEGER NOT NULL,
    "from_id" INTEGER NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friends_From_id_key" ON "Friends"("From_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friends_To_id_key" ON "Friends"("To_id");

-- CreateIndex
CREATE UNIQUE INDEX "Gammes_id_key" ON "Gammes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Gammes_playerone_id_key" ON "Gammes"("playerone_id");

-- CreateIndex
CREATE UNIQUE INDEX "Gammes_playertwo_id_key" ON "Gammes"("playertwo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Romms_id_key" ON "Romms"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Romms_user_user_id_key" ON "Romms_user"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Romms_user_room_id_key" ON "Romms_user"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "Messages_id_key" ON "Messages"("id");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_From_id_fkey" FOREIGN KEY ("From_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_To_id_fkey" FOREIGN KEY ("To_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gammes" ADD CONSTRAINT "Gammes_playerone_id_fkey" FOREIGN KEY ("playerone_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gammes" ADD CONSTRAINT "Gammes_playertwo_id_fkey" FOREIGN KEY ("playertwo_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romms" ADD CONSTRAINT "Romms_id_user_owner_fkey" FOREIGN KEY ("id_user_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romms_user" ADD CONSTRAINT "Romms_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Romms_user" ADD CONSTRAINT "Romms_user_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Romms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Romms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
