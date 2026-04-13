/* Replace legacy Kenya-only site keys with country-grouped locations:
   TZ (Dar es Salaam, Mtwara, Tanga), KE (Mombasa HQ, Nairobi), UG (Kampala), RW (Rwanda). */

ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_location;

UPDATE employees SET location = 'KE_MOMBASA' WHERE location = 'MOMBASA';
UPDATE employees SET location = 'KE_NAIROBI' WHERE location IN ('NAIROBI', 'KISUMU', 'LAMU', 'ELDORET');

DELETE FROM locations;

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS country_group VARCHAR(50) NOT NULL DEFAULT '';

INSERT INTO locations (location_key, name, is_head_office, status, country_group) VALUES
  ('TZ_DAR_ES_SALAAM', 'Dar es Salaam', FALSE, 'ACTIVE', 'Tanzania'),
  ('TZ_MTWARA', 'Mtwara', FALSE, 'ACTIVE', 'Tanzania'),
  ('TZ_TANGA', 'Tanga', FALSE, 'ACTIVE', 'Tanzania'),
  ('KE_MOMBASA', 'Mombasa (HQ)', TRUE, 'ACTIVE', 'Kenya'),
  ('KE_NAIROBI', 'Nairobi', FALSE, 'ACTIVE', 'Kenya'),
  ('UG_KAMPALA', 'Kampala', FALSE, 'ACTIVE', 'Uganda'),
  ('RW_RWANDA', 'Rwanda', FALSE, 'ACTIVE', 'Rwanda');

UPDATE employees SET location = 'KE_MOMBASA'
WHERE location IS NULL
   OR location = ''
   OR TRIM(location) NOT IN (SELECT location_key FROM locations);

ALTER TABLE employees
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN location SET DEFAULT 'KE_MOMBASA';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_location'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_employees_location
      FOREIGN KEY (location)
      REFERENCES locations (location_key)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employees_location ON employees (location);
CREATE INDEX IF NOT EXISTS idx_locations_country_group ON locations (country_group);
