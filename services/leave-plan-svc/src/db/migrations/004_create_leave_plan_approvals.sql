CREATE TABLE IF NOT EXISTS leave_plan_approvals (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES leave_plans(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,          -- manager | hr
    action VARCHAR(20) NOT NULL,        -- APPROVED | REJECTED
    approver_emp_no VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
