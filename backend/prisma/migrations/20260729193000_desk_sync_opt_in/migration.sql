-- CreateEnum
CREATE TYPE "DeskSyncStatus" AS ENUM ('NOT_LINKED', 'PENDING', 'SYNCED', 'FAILED', 'SKIPPED');

-- AlterTable doctors: optional SehtDesk link
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "sehatdoc_booking_slug" VARCHAR(100);
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "sehatdoc_doctor_user_id" UUID;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "sehatdoc_clinic_id" UUID;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "sehatdoc_sync_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "doctors_sehatdoc_booking_slug_key" ON "doctors"("sehatdoc_booking_slug");

-- AlterTable appointments: sync status
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "sync_status" "DeskSyncStatus" NOT NULL DEFAULT 'NOT_LINKED';
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "sync_error" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "synced_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "appointments_sync_status_idx" ON "appointments"("sync_status");
