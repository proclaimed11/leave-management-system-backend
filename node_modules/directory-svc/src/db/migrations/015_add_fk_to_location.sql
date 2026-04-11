/* =========================================================
   STEP C: Link employees.location → locations(location_key)
   ========================================================= */

/* 1) Ensure location column exists */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
      AND column_name = 'location'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN location VARCHAR(50) DEFAULT 'MOMBASA';
  END IF;
END $$;


/* 2) Ensure required locations exist BEFORE FK */
INSERT INTO locations (location_key, name, is_head_office)
VALUES
  ('MOMBASA', 'Mombasa – Head Office', TRUE),
  ('NAIROBI', 'Nairobi', FALSE),
  ('KISUMU', 'Kisumu', FALSE),
  ('LAMU', 'Lamu', FALSE),
  ('ELDORET', 'Eldoret', FALSE)
ON CONFLICT (location_key) DO NOTHING;


/* 3) Normalize existing employee location values */
UPDATE employees
SET location = 'MOMBASA'
WHERE location IS NULL
   OR location = ''
   OR location ILIKE '%mombasa%';

UPDATE employees
SET location = 'NAIROBI'
WHERE location ILIKE '%nairobi%';

UPDATE employees
SET location = 'KISUMU'
WHERE location ILIKE '%kisumu%';

UPDATE employees
SET location = 'LAMU'
WHERE location ILIKE '%lamu%';

UPDATE employees
SET location = 'ELDORET'
WHERE location ILIKE '%eldoret%';


/* 4) Enforce NOT NULL + DEFAULT */
ALTER TABLE employees
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN location SET DEFAULT 'MOMBASA';


/* 5) Add index (Postgres does NOT auto-index FKs) */
CREATE INDEX IF NOT EXISTS idx_employees_location
  ON employees(location);


/* 6) Add FK only if missing (NOT VALID first) */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_location'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_location
      FOREIGN KEY (location)
      REFERENCES locations(location_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;


/* 7) Validate FK once data is clean */
ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_location;
