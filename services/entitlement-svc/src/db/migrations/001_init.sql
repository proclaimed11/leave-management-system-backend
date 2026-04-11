
CREATE TABLE IF NOT EXISTS entitlements (
    id SERIAL PRIMARY KEY,

    employee_number VARCHAR(20) NOT NULL,
    leave_type_key  VARCHAR(50) NOT NULL,   -- e.g. 'ANNUAL', 'SICK', 'COMP_OFF'
    year            INTEGER NOT NULL,

    total_days      INTEGER NOT NULL DEFAULT 0,  -- entitlement for that year
    used_days       INTEGER NOT NULL DEFAULT 0,  -- how many consumed
    remaining_days  INTEGER NOT NULL DEFAULT 0,  -- total_days - used_days

    last_updated    TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (employee_number, leave_type_key, year)
);


CREATE INDEX IF NOT EXISTS idx_entitlements_emp_year
ON entitlements (employee_number, year);

CREATE INDEX IF NOT EXISTS idx_entitlements_emp_type_year
ON entitlements (employee_number, leave_type_key, year);


CREATE TABLE IF NOT EXISTS comp_off_entries (
    id SERIAL PRIMARY KEY,

    employee_number VARCHAR(20) NOT NULL,
    date_worked     DATE NOT NULL,
    hours_worked    INTEGER NOT NULL,         -- e.g. 4, 6, 8 hours
    earned_days     NUMERIC(5,2) NOT NULL,    -- e.g. 0.5, 1.0, 1.25

    source          VARCHAR(50),              -- 'SUNDAY', 'HOLIDAY', 'OVERTIME'
    approved        BOOLEAN NOT NULL DEFAULT false,

    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_comp_off_emp_date
ON comp_off_entries (employee_number, date_worked);

CREATE INDEX IF NOT EXISTS idx_comp_off_emp_created
ON comp_off_entries (employee_number, created_at);


CREATE TABLE IF NOT EXISTS entitlement_history (
    id SERIAL PRIMARY KEY,

    employee_number   VARCHAR(20) NOT NULL,
    leave_type_key    VARCHAR(50) NOT NULL,

    action            VARCHAR(50) NOT NULL,  
    days_changed      INTEGER NOT NULL,     

    old_total_days    INTEGER,
    new_total_days    INTEGER,

    old_remaining     INTEGER,
    new_remaining     INTEGER,

    reason            TEXT,
    updated_by        VARCHAR(50),           

    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entitlement_hist_emp_date
ON entitlement_history (employee_number, created_at);


CREATE TABLE IF NOT EXISTS entitlement_yearly_reset (
    id SERIAL PRIMARY KEY,

    employee_number  VARCHAR(20) NOT NULL,
    leave_type_key   VARCHAR(50) NOT NULL,

    year             INTEGER NOT NULL,          -- year being reset (e.g. 2025)
    carried_forward  INTEGER NOT NULL DEFAULT 0,

    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entitlement_reset_emp_year
ON entitlement_yearly_reset (employee_number, year);
