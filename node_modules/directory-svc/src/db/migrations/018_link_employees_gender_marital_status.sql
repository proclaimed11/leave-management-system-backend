
/* 1) Ensure gender column exists */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
      AND column_name = 'gender'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN gender VARCHAR(20);
  END IF;
END $$;


/* 2) Normalize existing gender values */
UPDATE employees
SET gender = UPPER(gender)
WHERE gender IS NOT NULL;

UPDATE employees
SET gender = 'MALE'
WHERE gender IN ('M', 'MAN', 'MALE');

UPDATE employees
SET gender = 'FEMALE'
WHERE gender IN ('F', 'WOMAN', 'FEMALE');

UPDATE employees
SET gender = 'OTHER'
WHERE gender NOT IN (
  'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'
)
AND gender IS NOT NULL;


/* 3) Add index (FKs are not auto-indexed) */
CREATE INDEX IF NOT EXISTS idx_employees_gender
  ON employees(gender);


/* 4) Add FK only if missing (NOT VALID first) */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_gender'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_gender
      FOREIGN KEY (gender)
      REFERENCES genders(gender_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;


/* 5) Validate FK once data is clean */
ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_gender;



/* =========================================================
   STEP D2: Link employees.marital_status → marital_statuses(status_key)
   ========================================================= */

/* 6) Ensure marital_status column exists */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees'
      AND column_name = 'marital_status'
  ) THEN
    ALTER TABLE employees
      ADD COLUMN marital_status VARCHAR(20);
  END IF;
END $$;


/* 7) Normalize existing marital status values */
UPDATE employees
SET marital_status = UPPER(marital_status)
WHERE marital_status IS NOT NULL;

UPDATE employees
SET marital_status = 'SINGLE'
WHERE marital_status IN ('S', 'SINGLE');

UPDATE employees
SET marital_status = 'MARRIED'
WHERE marital_status IN ('M', 'MARRIED');

UPDATE employees
SET marital_status = 'DIVORCED'
WHERE marital_status IN ('D', 'DIVORCED');

UPDATE employees
SET marital_status = 'WIDOWED'
WHERE marital_status IN ('W', 'WIDOWED');


/* 8) Add index */
CREATE INDEX IF NOT EXISTS idx_employees_marital_status
  ON employees(marital_status);


/* 9) Add FK only if missing (NOT VALID first) */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_marital_status'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_marital_status
      FOREIGN KEY (marital_status)
      REFERENCES marital_statuses(status_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;


/* 10) Validate FK once data is clean */
ALTER TABLE employees
  VALIDATE CONSTRAINT fk_employees_marital_status;
