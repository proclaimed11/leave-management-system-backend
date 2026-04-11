CREATE TABLE IF NOT EXISTS company_holidays (
  id              BIGSERIAL PRIMARY KEY,
  holiday_date    DATE NOT NULL,
  name            VARCHAR(150) NOT NULL,
  holiday_type    VARCHAR(20) NOT NULL DEFAULT 'PUBLIC', -- PUBLIC | COMPANY | SPECIAL
  company_key     VARCHAR(20) NULL,                      -- NULL = applies to all companies
  location        VARCHAR(60) NULL,                       -- NULL = applies to all locations
  is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,         -- repeats every year on same month/day
  notes           TEXT NULL,
  created_by      VARCHAR(50) NULL,                       -- employee_number of admin who created it
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_holidays_strict
ON company_holidays (
  holiday_date,
  COALESCE(company_key, '__ALL__'),
  COALESCE(location, '__ALL__')
);

CREATE INDEX IF NOT EXISTS idx_company_holidays_date
  ON company_holidays(holiday_date);

CREATE INDEX IF NOT EXISTS idx_company_holidays_company
  ON company_holidays(company_key);

CREATE INDEX IF NOT EXISTS idx_company_holidays_location
  ON company_holidays(location);
