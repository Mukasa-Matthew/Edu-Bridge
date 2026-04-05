CREATE TYPE sub_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount_ugx INT NOT NULL DEFAULT 10000 CHECK (amount_ugx > 0),
  status sub_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  payment_method VARCHAR(80),
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_student ON subscriptions (student_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
