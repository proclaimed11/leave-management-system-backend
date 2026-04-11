ALTER TABLE leave_approvals 
ADD COLUMN IF NOT EXISTS step_order INTEGER NOT NULL DEFAULT 1;

UPDATE leave_approvals
SET step_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY id) as row_num
  FROM leave_approvals
) AS subquery
WHERE leave_approvals.id = subquery.id;

ALTER TABLE leave_approvals 
DROP CONSTRAINT IF EXISTS uq_leave_approvals_request_step;

ALTER TABLE leave_approvals 
ADD CONSTRAINT uq_leave_approvals_request_step 
UNIQUE (request_id, step_order);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_pending 
ON leave_approvals (request_id, action, step_order) 
WHERE action = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_leave_approvals_approver 
ON leave_approvals (approver_emp_no) 
WHERE approver_emp_no IS NOT NULL;