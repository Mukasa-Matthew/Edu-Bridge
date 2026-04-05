CREATE TYPE level_category AS ENUM ('Primary', 'Secondary', 'University');
CREATE TYPE education_level AS ENUM (
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7',
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6',
  'Year_1', 'Year_2', 'Year_3', 'Year_4'
);
CREATE TYPE subscription_status AS ENUM ('inactive', 'active', 'expired', 'cancelled');

CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  school_name VARCHAR(255) NOT NULL,
  class_level education_level NOT NULL,
  level_category level_category NOT NULL,
  district VARCHAR(120) NOT NULL,
  physical_address TEXT NOT NULL,
  parent_guardian_name VARCHAR(255) NOT NULL,
  parent_guardian_phone VARCHAR(50) NOT NULL,
  subjects_of_interest TEXT[] NOT NULL DEFAULT '{}',
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
