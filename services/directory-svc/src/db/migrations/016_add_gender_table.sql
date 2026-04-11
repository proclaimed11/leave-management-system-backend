CREATE TABLE IF NOT EXISTS genders (
  gender_key VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO genders (gender_key, name) VALUES
  ('MALE', 'Male'),
  ('FEMALE', 'Female'),
  ('OTHER', 'Other'),
  ('PREFER_NOT_TO_SAY', 'Prefer not to say')
ON CONFLICT (gender_key) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_genders_status
  ON genders(status);           
  
