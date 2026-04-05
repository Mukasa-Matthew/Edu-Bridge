CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings (id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users (id),
  tutor_id UUID NOT NULL REFERENCES users (id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_tutor ON reviews (tutor_id);
