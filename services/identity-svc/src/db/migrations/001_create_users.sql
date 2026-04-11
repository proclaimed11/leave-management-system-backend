
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  employee_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,

  password_hash TEXT NOT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  last_login_at TIMESTAMP NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_employee_number UNIQUE (employee_number)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_number ON users(employee_number);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
