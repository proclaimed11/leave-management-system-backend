/* =========================================================
   STEP B (FIXED): Link employees.status → statuses(status_key)
   ========================================================= */

/* 1) Ensure status column exists */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
  END IF;
END $$;


/* 2) Ensure required statuses exist BEFORE FK */
INSERT INTO statuses (status_key, name, description)
VALUES
  ('ACTIVE', 'Active', 'Employee is currently active'),
  ('ARCHIVED', 'Archived', 'Employee retained for history')
ON CONFLICT (status_key) DO NOTHING;


/* 3) Normalize existing employee status values */
UPDATE employees
SET status = 'ACTIVE'
WHERE status IS NULL
   OR status IN ('active', 'Active', 'ACT');

UPDATE employees
SET status = 'ARCHIVED'
WHERE status IN ('archived', 'Archived', 'INACTIVE', 'TERMINATED');


/* 4) Enforce NOT NULL + DEFAULT */
ALTER TABLE employees
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'ACTIVE';


/* 5) Add index */
CREATE INDEX IF NOT EXISTS idx_employees_status
  ON employees(status);


/* 6) Add FK only if missing */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_status'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_status
      FOREIGN KEY (status)
      REFERENCES statuses(status_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;


/* 7) Validate FK (safe once data is clean) */
ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_status;
