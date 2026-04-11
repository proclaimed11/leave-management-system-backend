/* =========================================================
   ESL Departments
   ========================================================= */

INSERT INTO departments (dept_key, name, company_key)
VALUES
  ('ESL_AGENCY', 'Agency Department', 'ESL'),
  ('ESL_FINANCE', 'Finance Department', 'ESL'),
  ('ESL_TECH', 'Technical Department', 'ESL'),
  ('ESL_QHSSE', 'QHSSE Department', 'ESL'),
  ('ESL_AUDIT', 'Audit Department', 'ESL'),
  ('ESL_IT', 'IT Department', 'ESL'),
  ('ESL_HR', 'HR Department', 'ESL')
ON CONFLICT (dept_key) DO NOTHING;


/* =========================================================
   ESL Forwarders (EFL)
   ========================================================= */

INSERT INTO departments (dept_key, name, company_key)
VALUES
  ('EFL_KEY_ACCOUNTS', 'Key Accounts Champion', 'EFL'),
  ('EFL_DECLARATION', 'Declaration Department', 'EFL'),
  ('EFL_SHIPPING_LINE', 'Shipping Line Department', 'EFL'),
  ('EFL_TRANSPORT', 'Transport Department', 'EFL')
ON CONFLICT (dept_key) DO NOTHING;


/* =========================================================
   Sovereign Logistics (SLL)
   ========================================================= */

INSERT INTO departments (dept_key, name, company_key)
VALUES
  ('SLL_LOGISTICS', 'Logistics Department', 'SLL')
ON CONFLICT (dept_key) DO NOTHING;