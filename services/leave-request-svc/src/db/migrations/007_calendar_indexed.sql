CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS company_key TEXT;

UPDATE leave_requests
SET company_key = 'ESL'
WHERE company_key IS NULL;

ALTER TABLE leave_requests
ALTER COLUMN company_key SET NOT NULL;

ALTER TABLE leave_requests
DROP CONSTRAINT IF EXISTS chk_leave_dates_valid;

ALTER TABLE leave_requests
ADD CONSTRAINT chk_leave_dates_valid
CHECK (end_date >= start_date);

ALTER TABLE leave_requests
DROP CONSTRAINT IF EXISTS no_overlapping_approved_leave;

ALTER TABLE leave_requests
ADD CONSTRAINT no_overlapping_approved_leave
EXCLUDE USING GIST (
  company_key WITH =,
  employee_number WITH =,
  daterange(start_date, end_date, '[]') WITH &&
)
WHERE (status = 'APPROVED');

CREATE INDEX IF NOT EXISTS idx_leave_req_company_approved_dates
ON leave_requests (company_key, start_date, end_date)
WHERE status = 'APPROVED';
CREATE INDEX IF NOT EXISTS idx_leave_req_company_emp_approved_dates
ON leave_requests (company_key, employee_number, start_date, end_date)
WHERE status = 'APPROVED';

CREATE INDEX IF NOT EXISTS idx_leave_req_company_range_gist
ON leave_requests
USING GIST (
  company_key,
  daterange(start_date, end_date, '[]')
)
WHERE status = 'APPROVED';
