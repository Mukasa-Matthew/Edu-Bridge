ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users (id),
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
