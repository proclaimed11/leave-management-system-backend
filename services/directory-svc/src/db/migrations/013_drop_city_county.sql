-- Drop deprecated columns from employees
ALTER TABLE employees
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS county;
