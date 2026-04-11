ALTER TABLE entitlement_history
  ADD COLUMN IF NOT EXISTS reference_id TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;
