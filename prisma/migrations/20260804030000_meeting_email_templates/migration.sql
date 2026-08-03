-- Dual meeting email templates (guest + host)
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "guestEmailSubject" TEXT;
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "guestEmailBody" TEXT;
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "hostEmailSubject" TEXT;
ALTER TABLE "MeetingSettings" ADD COLUMN IF NOT EXISTS "hostEmailBody" TEXT;
