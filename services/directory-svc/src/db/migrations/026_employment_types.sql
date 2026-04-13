CREATE TABLE IF NOT EXISTS employment_types (
  type_key VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO employment_types (type_key, name, description) VALUES
  ('PERMANENT', 'Permanent', 'Open-ended / indefinite employment'),
  ('CONTRACT', 'Contract', 'Fixed-term or contract employment')
ON CONFLICT (type_key) DO NOTHING;

-- Clear values that would violate FK (custom strings from before lookup existed)
UPDATE employees
SET employment_type = NULL
WHERE employment_type IS NOT NULL
  AND TRIM(employment_type) NOT IN (SELECT type_key FROM employment_types);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_employment_type'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_employment_type
      FOREIGN KEY (employment_type)
      REFERENCES employment_types (type_key);
  END IF;
END $$;
