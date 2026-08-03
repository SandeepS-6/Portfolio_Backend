-- Add host image + default booking window 9:00–20:00
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "hostImageUrl" TEXT;

-- Align existing singleton to daytime hours (9am–8pm) when still on old evening defaults
UPDATE "MeetingSettings"
SET
  "dayStartMinutes" = 540,
  "dayEndMinutes" = 1200
WHERE "dayStartMinutes" = 1020
  AND "dayEndMinutes" = 1290;
