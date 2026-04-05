CREATE TYPE payment_type AS ENUM ('subscription', 'session_booking');
CREATE TYPE payment_method_type AS ENUM ('mtn_momo', 'airtel_money', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id),
  payment_type payment_type NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'UGX',
  payment_method payment_method_type NOT NULL,
  payment_reference VARCHAR(255),
  status payment_status NOT NULL DEFAULT 'pending',
  booking_id UUID REFERENCES bookings (id),
  subscription_id UUID REFERENCES subscriptions (id),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments (user_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_payment_type ON payments (payment_type);
