CREATE TABLE platform_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  platform_fee_percent INT NOT NULL DEFAULT 20 CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  subscription_price_ugx INT NOT NULL DEFAULT 10000 CHECK (subscription_price_ugx > 0),
  max_upload_bytes INT NOT NULL DEFAULT 10485760 CHECK (max_upload_bytes > 0),
  allowed_file_types TEXT NOT NULL DEFAULT 'pdf,doc,docx',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
