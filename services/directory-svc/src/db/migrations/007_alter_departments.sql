

-- 1) Add head_employee_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'departments' 
    AND column_name = 'head_employee_number'
  ) THEN
    ALTER TABLE departments 
      ADD COLUMN head_employee_number VARCHAR(20);
  END IF;
END $$;

-- 2) Add FK: head_employee_number → employees.employee_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_dept_head_emp'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT fk_dept_head_emp
      FOREIGN KEY (head_employee_number)
      REFERENCES employees(employee_number)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Add FK: employees.department → departments.dept_key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_employee_department'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employee_department
      FOREIGN KEY (department)
      REFERENCES departments(dept_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

-- 4) Create indices
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(head_employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- End of migration