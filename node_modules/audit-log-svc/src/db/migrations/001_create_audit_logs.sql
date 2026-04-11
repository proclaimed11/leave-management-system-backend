CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,

    event_type VARCHAR(100) NOT NULL,
    actor_employee_number VARCHAR(20),
    actor_role VARCHAR(20),
    target_employee_number VARCHAR(20),

    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT NOW()
);
