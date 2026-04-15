-- Revert HR/HOD country queue scoping: remove stored country prefix on leave rows.
DROP INDEX IF EXISTS idx_leave_req_requester_country;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS requester_country_prefix;
