-- CreateEnum
CREATE TYPE "GameState" AS ENUM ('live', 'finished');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "state" "GameState" NOT NULL DEFAULT 'live';
