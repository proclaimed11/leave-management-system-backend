/* =========================================================
   SEED: Executive Management (EXCOM) Departments
   ========================================================= */

/* ESL */
INSERT INTO departments (dept_key, name, company_key, status)
VALUES (
  'ESL_EXCOM',
  'Executive Management',
  'ESL',
  'active'
)
ON CONFLICT (dept_key) DO NOTHING;

/* EFL */
INSERT INTO departments (dept_key, name, company_key, status)
VALUES (
  'EFL_EXCOM',
  'Executive Management',
  'EFL',
  'active'
)
ON CONFLICT (dept_key) DO NOTHING;

/* SLL */
INSERT INTO departments (dept_key, name, company_key, status)
VALUES (
  'SLL_EXCOM',
  'Executive Management',
  'SLL',
  'active'
)
ON CONFLICT (dept_key) DO NOTHING;
