CREATE TABLE IF NOT EXISTS plan_conflicts (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES leave_plans(id) ON DELETE CASCADE,
    conflicting_employee VARCHAR(20) NOT NULL,
    conflicting_plan_id INTEGER,
    severity VARCHAR(10) NOT NULL DEFAULT 'low',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_conflicts_plan
  ON plan_conflicts(plan_id);
