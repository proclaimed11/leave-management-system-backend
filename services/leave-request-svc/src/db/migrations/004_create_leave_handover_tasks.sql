CREATE TABLE IF NOT EXISTS leave_handover_tasks (
    id SERIAL PRIMARY KEY,
    handover_id INTEGER REFERENCES leave_handover(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,

    updated_by VARCHAR(20),               -- ESL-001 or ESL-002
    order_index INTEGER DEFAULT 0,        -- for UI ordering

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handover_tasks_hid
ON leave_handover_tasks (handover_id);
