CREATE TABLE IF NOT EXISTS roles (
  role_key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO roles (role_key, name, description) VALUES
('employee', 'Employee', 'Standard employee'),
('supervisor', 'Supervisor', 'Approves direct reports'),
('hod', 'Head of Department', 'Oversees department'),
('HR', 'HR Officer', 'Manages employees and policies'),
('admin', 'Administrator', 'System administrator'),
('management', 'Management', 'Executive oversight'),
('consultant', 'Consultant', 'External read-only access')
ON CONFLICT (role_key) DO NOTHING;
