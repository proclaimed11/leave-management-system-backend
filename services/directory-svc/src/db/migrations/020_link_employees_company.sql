
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
      AND column_name = 'company_key'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN company_key VARCHAR(20) DEFAULT 'ESL';
  END IF;
END $$;


UPDATE employees
SET company_key = 'ESL'
WHERE company_key IS NULL;


ALTER TABLE employees
  ALTER COLUMN company_key SET NOT NULL,
  ALTER COLUMN company_key SET DEFAULT 'ESL';


CREATE INDEX IF NOT EXISTS idx_employees_company
  ON employees(company_key);


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_company'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_company
      FOREIGN KEY (company_key)
      REFERENCES companies(company_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;


ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_company;
