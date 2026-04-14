CREATE TABLE IF NOT EXISTS website_page_analytics_daily (
  day DATE NOT NULL,
  page_path TEXT NOT NULL,
  page_views INTEGER NOT NULL DEFAULT 0 CHECK (page_views >= 0),
  unique_visitors INTEGER NOT NULL DEFAULT 0 CHECK (unique_visitors >= 0),
  avg_session_seconds INTEGER NOT NULL DEFAULT 0 CHECK (avg_session_seconds >= 0),
  bounce_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (bounce_rate_percent >= 0 AND bounce_rate_percent <= 100),
  source TEXT NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (day, page_path)
);

CREATE INDEX IF NOT EXISTS idx_website_page_analytics_daily_day
  ON website_page_analytics_daily (day DESC);

CREATE INDEX IF NOT EXISTS idx_website_page_analytics_daily_views
  ON website_page_analytics_daily (page_views DESC);
