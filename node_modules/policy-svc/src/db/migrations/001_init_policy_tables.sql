
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    type_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS leave_rules (
    id SERIAL PRIMARY KEY,
    leave_type_id INTEGER REFERENCES leave_types(id) ON DELETE CASCADE,

    entitlement_days INTEGER,
    max_consecutive_days INTEGER,
    max_per_year INTEGER,

    requires_approval BOOLEAN DEFAULT true,
    approval_levels INTEGER DEFAULT 1,

    paid BOOLEAN DEFAULT true,
    deduct_from_balance BOOLEAN DEFAULT true,

    requires_document BOOLEAN DEFAULT false,
    attachment_required_after_days INTEGER,

    allow_weekends BOOLEAN DEFAULT false,
    allow_public_holidays BOOLEAN DEFAULT false,

    min_service_months INTEGER,
    gender_restriction VARCHAR(10) DEFAULT 'any',

    notice_days_required INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS comp_off_rules (
    id SERIAL PRIMARY KEY,
    hours_per_off_day INTEGER DEFAULT 8,
    sunday_work_earn BOOLEAN DEFAULT true,
    public_holiday_earn BOOLEAN DEFAULT true,
    max_carry_forward INTEGER DEFAULT 0,
    expiry_days INTEGER DEFAULT 90,
    min_hours_per_entry INTEGER DEFAULT 4
);
