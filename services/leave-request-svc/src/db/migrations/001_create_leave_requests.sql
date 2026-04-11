CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,

    employee_number VARCHAR(20) NOT NULL,
    leave_type_key VARCHAR(50) NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,

    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, cancelled

    handover_notes TEXT,
    handover_document TEXT,
    handover_to VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_req_emp
ON leave_requests (employee_number);

CREATE INDEX IF NOT EXISTS idx_leave_req_status
ON leave_requests (status);

CREATE INDEX IF NOT EXISTS idx_leave_req_date
ON leave_requests (start_date, end_date);
