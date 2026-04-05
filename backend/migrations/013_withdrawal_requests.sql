CREATE TYPE withdrawal_status AS ENUM ('pending', 'completed', 'rejected');

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount_ugx INT NOT NULL CHECK (amount_ugx > 0),
  method payment_method_type NOT NULL,
  account_detail VARCHAR(255) NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawals_tutor ON withdrawal_requests (tutor_id);
