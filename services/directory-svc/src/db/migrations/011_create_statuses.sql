CREATE TABLE IF NOT EXISTS statuses (
  status_key   VARCHAR(50) PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
