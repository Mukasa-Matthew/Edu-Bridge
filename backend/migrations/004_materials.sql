CREATE TYPE material_type AS ENUM (
  'past_paper',
  'revision_notes',
  'practice_questions',
  'video_notes',
  'textbook_summary'
);
CREATE TYPE material_file_type AS ENUM ('pdf', 'doc', 'docx', 'video_link', 'external');
CREATE TYPE material_approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  material_type material_type NOT NULL,
  subject VARCHAR(120) NOT NULL,
  education_level education_level NOT NULL,
  level_category level_category NOT NULL,
  year INT,
  file_type material_file_type NOT NULL,
  file_url TEXT,
  video_url TEXT,
  file_size BIGINT,
  file_name VARCHAR(255),
  uploaded_by UUID NOT NULL REFERENCES users (id),
  uploader_role user_role NOT NULL,
  approval_status material_approval_status NOT NULL DEFAULT 'pending',
  download_count INT NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_materials_education_level ON materials (education_level);
CREATE INDEX idx_materials_subject ON materials (subject);
CREATE INDEX idx_materials_material_type ON materials (material_type);
CREATE INDEX idx_materials_approval ON materials (approval_status);
