CREATE TABLE IF NOT EXISTS marital_statuses (
  status_key VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO marital_statuses (status_key, name) VALUES
  ('SINGLE', 'Single'),
  ('MARRIED', 'Married'),
  ('DIVORCED', 'Divorced'),
  ('WIDOWED', 'Widowed')
ON CONFLICT (status_key) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_marital_statuses_status
  ON marital_statuses(status);