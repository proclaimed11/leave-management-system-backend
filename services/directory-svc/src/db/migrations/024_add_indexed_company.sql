CREATE INDEX IF NOT EXISTS idx_employees_company_dept_active
ON employees (company_key, department)
WHERE status = 'ACTIVE';
