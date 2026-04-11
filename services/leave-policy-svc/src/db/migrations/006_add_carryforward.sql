ALTER TABLE leave_rules
ADD COLUMN IF NOT EXISTS allow_carry_forward BOOLEAN DEFAULT FALSE;

ALTER TABLE leave_rules
ADD COLUMN IF NOT EXISTS max_carry_forward_days INTEGER DEFAULT 0;

ALTER TABLE leave_rules
ADD COLUMN IF NOT EXISTS carry_forward_expiry_days INTEGER;