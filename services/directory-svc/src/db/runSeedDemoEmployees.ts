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
    employee_number: "HR-DEMO-01",
    full_name: "Demo HR Officer",
    email: "hr.demo@mail.com",
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
    employee_number: "EMP-DEMO-01",
    full_name: "Demo Employee",
    email: "employee.demo@mail.com",
    department: "ESL_AGENCY",
    title: "Agent",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "employee",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "SUP-DEMO-01",
    full_name: "Demo Supervisor",
    email: "supervisor.demo@mail.com",
    department: "ESL_TECH",
    title: "Team Lead",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "supervisor",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HOD-DEMO-01",
    full_name: "Demo Head of Department",
    email: "hod.demo@mail.com",
    department: "ESL_QHSSE",
    title: "HOD",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "hod",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "HOD-IT-01",
    full_name: "Demo IT Head of Department",
    email: "hod.it@mail.com",
    department: "ESL_IT",
    title: "HOD",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_NAIROBI",
    directory_role: "hod",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "MGT-DEMO-01",
    full_name: "Demo Management",
    email: "management.demo@mail.com",
    department: "ESL_EXCOM",
    title: "Executive",
    employment_type: "PERMANENT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "management",
    company_key: "ESL",
    identity_password: "password123",
  },
  {
    employee_number: "CON-DEMO-01",
    full_name: "Demo Consultant",
    email: "consultant.demo@mail.com",
    department: "ESL_AUDIT",
    title: "Consultant",
    employment_type: "CONTRACT",
    status: "ACTIVE",
    location: "KE_MOMBASA",
    directory_role: "consultant",
    company_key: "ESL",
    identity_password: "password123",
  },
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
