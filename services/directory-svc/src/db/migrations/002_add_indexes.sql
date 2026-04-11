CREATE INDEX IF NOT EXISTS idx_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_manager ON employees(manager_employee_number);
CREATE INDEX IF NOT EXISTS idx_full_name ON employees(full_name);
CREATE INDEX IF NOT EXISTS idx_email ON employees(email);
