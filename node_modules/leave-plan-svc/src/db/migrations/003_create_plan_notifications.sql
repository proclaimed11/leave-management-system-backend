CREATE TABLE IF NOT EXISTS plan_notifications (
    id SERIAL PRIMARY KEY,
    employee_number VARCHAR(20) NOT NULL,
    plan_id INTEGER REFERENCES leave_plans(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
