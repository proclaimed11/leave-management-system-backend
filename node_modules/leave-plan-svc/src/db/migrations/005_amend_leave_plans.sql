UPDATE leave_plans
SET status = 'PLANNED'
WHERE status IS NULL
   OR status NOT IN ('PLANNED', 'CANCELLED', 'CONVERTED');

ALTER TABLE leave_plans
ADD CONSTRAINT chk_leave_plan_status
CHECK (status IN ('PLANNED', 'CANCELLED', 'CONVERTED'));

ALTER TABLE leave_plans
ADD COLUMN IF NOT EXISTS converted_leave_request_id INTEGER;

ALTER TABLE plan_conflicts
ADD CONSTRAINT fk_plan_conflicts_conflicting_plan
FOREIGN KEY (conflicting_plan_id)
REFERENCES leave_plans(id)
ON DELETE CASCADE;

DROP TABLE IF EXISTS leave_plan_approvals;
