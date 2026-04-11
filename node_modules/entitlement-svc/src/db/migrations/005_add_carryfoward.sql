BEGIN;

ALTER TABLE entitlements
ADD COLUMN IF NOT EXISTS carry_forward INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'entitlements_carry_forward_non_negative'
    ) THEN
        ALTER TABLE entitlements
        ADD CONSTRAINT entitlements_carry_forward_non_negative
        CHECK (carry_forward >= 0);
    END IF;
END $$;

COMMIT;
