
CREATE TABLE IF NOT EXISTS locations (
  location_key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_head_office BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


INSERT INTO locations (location_key, name, is_head_office) VALUES
  ('MOMBASA', 'Mombasa – Head Office', TRUE),
  ('NAIROBI', 'Nairobi', FALSE),
  ('KISUMU', 'Kisumu', FALSE),
  ('LAMU', 'Lamu', FALSE),
  ('ELDORET', 'Eldoret', FALSE)
ON CONFLICT (location_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_locations_status
  ON locations(status);
