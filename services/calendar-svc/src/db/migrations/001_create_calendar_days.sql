CREATE TABLE IF NOT EXISTS calendar_days (
    id SERIAL PRIMARY KEY,
    calendar_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    employee_number VARCHAR(20) NOT NULL,
    leave_type_key VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(calendar_date, employee_number)
);

CREATE INDEX IF NOT EXISTS idx_calendar_date
ON calendar_days (calendar_date);

CREATE INDEX IF NOT EXISTS idx_calendar_dept
ON calendar_days (department);
