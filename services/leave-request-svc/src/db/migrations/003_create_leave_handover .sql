CREATE TABLE IF NOT EXISTS leave_handover (
    id SERIAL PRIMARY KEY,
    request_id INTEGER UNIQUE REFERENCES leave_requests(id) ON DELETE CASCADE,

    handover_to VARCHAR(20) NOT NULL,    
    notes TEXT,
    document_url TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
