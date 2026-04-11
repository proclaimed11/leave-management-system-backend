-- 1) Ensure the column exists and has a default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'directory_role'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN directory_role VARCHAR(50) DEFAULT 'employee';
  END IF;
END $$;

-- 2) Backfill NULLs to a valid default
UPDATE employees
SET directory_role = 'employee'
WHERE directory_role IS NULL;

-- 3) (Optional) normalize stray values (adjust mapping if needed)
-- UPDATE employees SET directory_role = 'employee'   WHERE directory_role IN ('user');
-- UPDATE employees SET directory_role = 'supervisor' WHERE directory_role IN ('manager');

-- 4) Enforce NOT NULL now that data is clean
ALTER TABLE employees
  ALTER COLUMN directory_role SET NOT NULL,
  ALTER COLUMN directory_role SET DEFAULT 'employee';

-- 5) Add an index on the referencing column (Postgres doesn't auto-index FKs)
CREATE INDEX IF NOT EXISTS idx_employees_directory_role ON employees(directory_role);

-- 1) Ensure the column exists and has a default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'directory_role'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN directory_role VARCHAR(50) DEFAULT 'employee';
  END IF;
END $$;

-- 2) Backfill NULLs to a valid default
UPDATE employees
SET directory_role = 'employee'
WHERE directory_role IS NULL;

-- 3) (Optional) normalize stray values (adjust mapping if needed)
-- UPDATE employees SET directory_role = 'employee'   WHERE directory_role IN ('user');
-- UPDATE employees SET directory_role = 'supervisor' WHERE directory_role IN ('manager');

-- 4) Enforce NOT NULL now that data is clean
ALTER TABLE employees
  ALTER COLUMN directory_role SET NOT NULL,
  ALTER COLUMN directory_role SET DEFAULT 'employee';

-- 5) Add an index on the referencing column (Postgres doesn't auto-index FKs)
CREATE INDEX IF NOT EXISTS idx_employees_directory_role ON employees(directory_role);

-- 6) Add FK constraint only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_directory_role'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_directory_role
      FOREIGN KEY (directory_role)
      REFERENCES roles(role_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;

-- 7) Validate FK constraint (safe to re-run)
ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_directory_role;

