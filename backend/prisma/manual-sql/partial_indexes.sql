-- Run after `prisma migrate` (Prisma cannot express partial unique indexes).
-- Prevents two active bookings on the same doctor slot.

CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_slot_active_uidx
ON appointments (doctor_id, scheduled_start)
WHERE status NOT IN ('CANCELLED', 'EXPIRED', 'RESCHEDULED');

-- At most one PAID payment per payable (proof retries allowed while not PAID)
CREATE UNIQUE INDEX IF NOT EXISTS payments_payable_paid_uidx
ON payments (payable_type, payable_id)
WHERE status = 'PAID';

-- Speeds “expire unpaid holds” worker
CREATE INDEX IF NOT EXISTS appointments_pending_payment_expires_idx
ON appointments (payment_expires_at)
WHERE status = 'PENDING_PAYMENT';

CREATE INDEX IF NOT EXISTS lab_orders_pending_payment_expires_idx
ON lab_orders (payment_expires_at)
WHERE status = 'PENDING_PAYMENT';

-- Staff queue: proofs waiting for review
CREATE INDEX IF NOT EXISTS payment_proofs_pending_review_idx
ON payment_proofs (uploaded_at)
WHERE status = 'UPLOADED';
