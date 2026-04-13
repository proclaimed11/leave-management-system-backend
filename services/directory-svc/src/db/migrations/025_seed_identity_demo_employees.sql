/* =========================================================
   Align directory employees with identity-svc demo users
   (same employee_number + email as identity seed / runSeedDemoUsers)
   ========================================================= */

INSERT INTO employees (
  employee_number,
  full_name,
  email,
  department,
  title,
  employment_type,
  status,
  location,
  directory_role,
  company_key
) VALUES
  ('SYSADMIN', 'System Administrator', 'admin@mail.com', 'ESL_IT', 'Administrator', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'admin', 'ESL'),
  ('HR-DEMO-01', 'Demo HR Officer', 'hr.demo@mail.com', 'ESL_HR', 'HR Officer', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'HR', 'ESL'),
  ('EMP-DEMO-01', 'Demo Employee', 'employee.demo@mail.com', 'ESL_AGENCY', 'Agent', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'employee', 'ESL'),
  ('SUP-DEMO-01', 'Demo Supervisor', 'supervisor.demo@mail.com', 'ESL_TECH', 'Team Lead', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'supervisor', 'ESL'),
  ('HOD-DEMO-01', 'Demo Head of Department', 'hod.demo@mail.com', 'ESL_QHSSE', 'HOD', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'hod', 'ESL'),
  ('MGT-DEMO-01', 'Demo Management', 'management.demo@mail.com', 'ESL_EXCOM', 'Executive', 'PERMANENT', 'ACTIVE', 'MOMBASA', 'management', 'ESL'),
  ('CON-DEMO-01', 'Demo Consultant', 'consultant.demo@mail.com', 'ESL_AUDIT', 'Consultant', 'CONTRACT', 'ACTIVE', 'MOMBASA', 'consultant', 'ESL')
ON CONFLICT (employee_number) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  title = EXCLUDED.title,
  employment_type = EXCLUDED.employment_type,
  status = EXCLUDED.status,
  location = EXCLUDED.location,
  directory_role = EXCLUDED.directory_role,
  company_key = EXCLUDED.company_key;
