import { pool } from "./connection";
import { onboardIdentityUser } from "../services/identityClient";

type DemoEmployee = {
  employee_number: string;
  full_name: string;
  email: string;
  department: string;
  title: string;
  employment_type: string;
  status: string;
  location: string;
  directory_role: string;
  company_key: string;
  identity_password: string;
};

const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    employee_number: "ADM-DEMO-01",
    full_name: "Demo Administrator",
    email: "admin.demo@mail.com",
    department: "ESL_IT",
    title: "Administrator",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "admin",
    company_key: "ESL",
    identity_password: "password",
  },
  {
    employee_number: "HR-TZ-01",
    full_name: "HR Tanzania",
    email: "hr.tz@mail.com",
    department: "ESL_HR",
    title: "HR Officer",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "TZ_DAR_ES_SALAAM",
    directory_role: "HR",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HR-KE-01",
    full_name: "HR Kenya",
    email: "hr.ke@mail.com",
    department: "ESL_HR",
    title: "HR Officer",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "HR",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HR-UG-01",
    full_name: "HR Uganda",
    email: "hr.ug@mail.com",
    department: "ESL_HR",
    title: "HR Officer",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "UG_KAMPALA",
    directory_role: "HR",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HR-RW-01",
    full_name: "HR Rwanda",
    email: "hr.rw@mail.com",
    department: "ESL_HR",
    title: "HR Officer",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "RW_RWANDA",
    directory_role: "HR",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HOD-IT-01",
    full_name: "HOD IT",
    email: "hod.it@mail.com",
    department: "ESL_IT",
    title: "HOD",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "TZ_DAR_ES_SALAAM",
    directory_role: "hod",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HOD-FIN-01",
    full_name: "HOD Finance",
    email: "hod.finance@mail.com",
    department: "ESL_FINANCE",
    title: "HOD",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "hod",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HOD-AGY-01",
    full_name: "HOD Agency",
    email: "hod.agency@mail.com",
    department: "ESL_AGENCY",
    title: "HOD",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "UG_KAMPALA",
    directory_role: "hod",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-TZ-01",
    full_name: "Employee 1 Tanzania",
    email: "employee1.tz@mail.com",
    department: "ESL_IT",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "TZ_DAR_ES_SALAAM",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-TZ-02",
    full_name: "Employee 2 Tanzania",
    email: "employee2.tz@mail.com",
    department: "ESL_IT",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "TZ_DAR_ES_SALAAM",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-KE-01",
    full_name: "Employee 1 Kenya",
    email: "employee1.ke@mail.com",
    department: "ESL_FINANCE",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-KE-02",
    full_name: "Employee 2 Kenya",
    email: "employee2.ke@mail.com",
    department: "ESL_FINANCE",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-UG-01",
    full_name: "Employee 1 Uganda",
    email: "employee1.ug@mail.com",
    department: "ESL_AGENCY",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "UG_KAMPALA",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "EMP-UG-02",
    full_name: "Employee 2 Uganda",
    email: "employee2.ug@mail.com",
    department: "ESL_AGENCY",
    title: "Employee",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "UG_KAMPALA",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
];

const DEPRECATED_SEED_EMAILS = [
  "admin@mail.com",
  "hr.demo@mail.com",
  "employee.demo@mail.com",
  "supervisor.demo@mail.com",
  "hod.demo@mail.com",
  "management.demo@mail.com",
  "consultant.demo@mail.com",
];

async function upsertEmployee(emp: DemoEmployee): Promise<void> {
  await pool.query(
    `
    INSERT INTO employees (
      employee_number, full_name, email, department, title,
      employment_type, status, location, directory_role, company_key
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (email) DO UPDATE SET
      employee_number = EXCLUDED.employee_number,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      department = EXCLUDED.department,
      title = EXCLUDED.title,
      employment_type = EXCLUDED.employment_type,
      status = EXCLUDED.status,
      location = EXCLUDED.location,
      directory_role = EXCLUDED.directory_role,
      company_key = EXCLUDED.company_key
    `,
    [
      emp.employee_number,
      emp.full_name,
      emp.email.toLowerCase(),
      emp.department,
      emp.title,
      emp.employment_type,
      emp.status,
      emp.location,
      emp.directory_role,
      emp.company_key,
    ]
  );
}

export async function seedDemoEmployees(): Promise<void> {
  if (DEPRECATED_SEED_EMAILS.length > 0) {
    await pool.query(`DELETE FROM employees WHERE email = ANY($1::text[])`, [DEPRECATED_SEED_EMAILS]);
  }

  for (const emp of DEMO_EMPLOYEES) {
    await upsertEmployee(emp);
    console.log(`Directory employee upserted: ${emp.email}`);

    const identityResult = await onboardIdentityUser({
      employee_number: emp.employee_number,
      email: emp.email,
      password: emp.identity_password,
      must_change_password: false,
      allow_existing: true,
    });

    if (identityResult.user_created) {
      console.log(`Identity user provisioned: ${emp.email}`);
    } else {
      console.warn(`Identity provision skipped/failed for ${emp.email}:`, identityResult.error);
    }
  }
}

if (require.main === module) {
  seedDemoEmployees()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
