ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.must_change_password IS 'When true, user must change password before full app access (e.g. initial hire password).';
