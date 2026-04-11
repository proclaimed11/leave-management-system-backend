DROP TABLE IF EXISTS comp_off_entries;

CREATE TABLE comp_off_entries (
    id BIGSERIAL PRIMARY KEY,

    employee_number VARCHAR(50) NOT NULL,

    hours_earned NUMERIC(10,2) NOT NULL,     -- raw hours
    days_credited NUMERIC(10,2) NOT NULL,    -- converted to days (2dp)

    source VARCHAR(20) NOT NULL,             -- 'SUNDAY', 'PUBLIC_HOLIDAY', 'AFTER_HOURS'

    date_worked DATE NOT NULL,
    expires_at  DATE,                        -- expiry logic from policy

    status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
        -- APPROVED = credited immediately
        -- PENDING = waiting for manager approval

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Optimized for filters + reporting
CREATE INDEX IF NOT EXISTS idx_comp_off_emp ON comp_off_entries(employee_number);
CREATE INDEX IF NOT EXISTS idx_comp_off_expires ON comp_off_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_comp_off_status ON comp_off_entries(status);
