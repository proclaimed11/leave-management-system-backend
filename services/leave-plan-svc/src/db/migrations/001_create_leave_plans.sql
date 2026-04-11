CREATE TABLE IF NOT EXISTS leave_plans (
    id SERIAL PRIMARY KEY,
    employee_number VARCHAR(20) NOT NULL,
    leave_type_key VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_plans_emp
  ON leave_plans (employee_number);

CREATE INDEX IF NOT EXISTS idx_leave_plans_dates
  ON leave_plans (start_date, end_date);


