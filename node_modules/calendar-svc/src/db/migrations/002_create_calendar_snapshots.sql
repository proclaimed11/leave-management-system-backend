CREATE TABLE IF NOT EXISTS calendar_snapshots (
    id SERIAL PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    total_employees INTEGER NOT NULL,
    total_leaves INTEGER NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(department, year_month)
);

CREATE INDEX IF NOT EXISTS idx_calendar_snapshot
ON calendar_snapshots (department, year_month);
