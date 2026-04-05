CREATE TYPE qualification_level AS ENUM ('certificate', 'diploma', 'bachelor', 'master', 'phd', 'other');
CREATE TYPE experience_band AS ENUM ('lt_1', 'y1_2', 'y3_5', 'y6_10', 'y10_plus');
CREATE TYPE session_mode_type AS ENUM ('online', 'in_person', 'both');
CREATE TYPE tutor_approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TABLE tutor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  national_id VARCHAR(80) NOT NULL,
  highest_qualification qualification_level NOT NULL,
  institution_attended VARCHAR(255) NOT NULL,
  graduation_year INT NOT NULL CHECK (graduation_year >= 1990 AND graduation_year <= 2035),
  current_employer VARCHAR(255) NOT NULL,
  years_experience experience_band NOT NULL,
  bio TEXT NOT NULL,
  primary_subject VARCHAR(120) NOT NULL,
  secondary_subject VARCHAR(120),
  teaching_levels TEXT[] NOT NULL DEFAULT '{}',
  session_mode session_mode_type NOT NULL,
  group_session_rate_ugx INT NOT NULL CHECK (group_session_rate_ugx > 0),
  one_on_one_rate_ugx INT NOT NULL CHECK (one_on_one_rate_ugx > 0),
  district VARCHAR(120) NOT NULL,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INT NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  total_students INT NOT NULL DEFAULT 0 CHECK (total_students >= 0),
  tutor_status tutor_approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tutor_primary_subject ON tutor_profiles (primary_subject);
CREATE INDEX idx_tutor_status ON tutor_profiles (tutor_status);
CREATE INDEX idx_tutor_district ON tutor_profiles (district);
