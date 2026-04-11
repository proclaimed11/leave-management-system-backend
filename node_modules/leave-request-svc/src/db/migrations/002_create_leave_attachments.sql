CREATE TABLE IF NOT EXISTS leave_attachments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES leave_requests(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
