BEGIN;

CREATE TABLE IF NOT EXISTS otp_requests (
  id SERIAL PRIMARY KEY,

  email VARCHAR(255) NOT NULL,

  otp_hash TEXT NOT NULL,

  expires_at TIMESTAMP NOT NULL,

  attempts INTEGER NOT NULL DEFAULT 0,

  used BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_requests_email_created
  ON otp_requests (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_otp_requests_expires_at
  ON otp_requests (expires_at);

COMMIT;
