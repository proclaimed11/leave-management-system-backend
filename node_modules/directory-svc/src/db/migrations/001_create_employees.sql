CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(50),
  title VARCHAR(50),
  manager_employee_number VARCHAR(20),
  employment_type VARCHAR(20), 
  status VARCHAR(20) DEFAULT 'active',
  location VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
