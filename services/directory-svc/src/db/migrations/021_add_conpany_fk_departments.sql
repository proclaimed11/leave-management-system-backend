/* =========================================================
   STEP 1: Add company_key column to departments
   ========================================================= */

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'departments'
      AND column_name = 'company_key'
  ) THEN
    ALTER TABLE departments
      ADD COLUMN company_key VARCHAR(50);
  END IF;
END $$;


/* =========================================================
   STEP 2: Backfill existing departments (default to ESL)
   ========================================================= */

UPDATE departments
SET company_key = 'ESL'
WHERE company_key IS NULL;


/* =========================================================
   STEP 3: Enforce NOT NULL
   ========================================================= */

ALTER TABLE departments
  ALTER COLUMN company_key SET NOT NULL;


/* =========================================================
   STEP 4: Add FK → companies(company_key)
   ========================================================= */

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_departments_company'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT fk_departments_company
      FOREIGN KEY (company_key)
      REFERENCES companies(company_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;

ALTER TABLE departments
  VALIDATE CONSTRAINT fk_departments_company;


/* =========================================================
   STEP 5: Ensure department uniqueness PER company
   ========================================================= */

CREATE UNIQUE INDEX IF NOT EXISTS
  ux_departments_company_dept_key
ON departments(company_key, dept_key);


/* =========================================================
   STEP 6: Useful indexes
   ========================================================= */

CREATE INDEX IF NOT EXISTS idx_departments_company
  ON departments(company_key);

CREATE INDEX IF NOT EXISTS idx_departments_status
  ON departments(status);
