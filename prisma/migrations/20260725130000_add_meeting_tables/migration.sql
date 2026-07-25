-- CreateTable
CREATE TABLE "MeetingSettings" (
    "id" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "hostInitials" TEXT,
    "title" TEXT NOT NULL DEFAULT '30 min meeting',
    "durations" INTEGER[] DEFAULT ARRAY[30, 60]::INTEGER[],
    "locationLabel" TEXT NOT NULL DEFAULT 'Google Meet',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "workDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "dayStartMinutes" INTEGER NOT NULL DEFAULT 1020,
    "dayEndMinutes" INTEGER NOT NULL DEFAULT 1290,
    "slotIntervalMin" INTEGER NOT NULL DEFAULT 30,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingBooking" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "subject" TEXT,
    "notes" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "locationLabel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingBooking_startAt_endAt_idx" ON "MeetingBooking"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "MeetingBooking_status_startAt_idx" ON "MeetingBooking"("status", "startAt");
