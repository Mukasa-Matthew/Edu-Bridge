CREATE TYPE session_type_booking AS ENUM ('group', 'one_on_one');
CREATE TYPE booking_session_mode AS ENUM ('online', 'in_person');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'completed', 'cancelled');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users (id),
  tutor_id UUID NOT NULL REFERENCES users (id),
  subject VARCHAR(120) NOT NULL,
  session_type session_type_booking NOT NULL,
  session_mode booking_session_mode NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  amount_student_pays INT NOT NULL CHECK (amount_student_pays > 0),
  platform_fee INT NOT NULL CHECK (platform_fee >= 0),
  tutor_earnings INT NOT NULL CHECK (tutor_earnings >= 0),
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_student ON bookings (student_id);
CREATE INDEX idx_bookings_tutor ON bookings (tutor_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_scheduled ON bookings (scheduled_at);
