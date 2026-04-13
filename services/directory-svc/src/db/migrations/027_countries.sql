CREATE TABLE IF NOT EXISTS countries (
  country_key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO countries (country_key, name) VALUES
  ('TANZANIA', 'Tanzania'),
  ('KENYA', 'Kenya'),
  ('RWANDA', 'Rwanda'),
  ('UGANDA', 'Uganda')
ON CONFLICT (country_key) DO NOTHING;

-- Align existing free-text values to canonical keys where obvious
UPDATE employees e
SET country = c.country_key
FROM countries c
WHERE e.country IS NOT NULL
  AND UPPER(TRIM(e.country)) = c.country_key;

UPDATE employees
SET country = NULL
WHERE country IS NOT NULL
  AND TRIM(country) NOT IN (SELECT country_key FROM countries);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_country'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_country
      FOREIGN KEY (country)
      REFERENCES countries (country_key);
  END IF;
END $$;
