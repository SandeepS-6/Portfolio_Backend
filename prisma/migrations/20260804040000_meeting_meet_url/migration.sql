-- AlterTable
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "meetUrl" TEXT;

-- AlterTable
ALTER TABLE "MeetingBooking" ADD COLUMN IF NOT EXISTS "meetUrl" TEXT;
