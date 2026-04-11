CREATE TABLE IF NOT EXISTS leave_approvals (
    id SERIAL PRIMARY KEY,

    request_id INTEGER NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,

    approver_emp_no VARCHAR(20),            
    role VARCHAR(50) NOT NULL,             

    action VARCHAR(20) NOT NULL DEFAULT 'PENDING', 
                                            
    remarks TEXT,
    acted_at TIMESTAMP NULL,                

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_request
ON leave_approvals (request_id);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_role
ON leave_approvals (role);
