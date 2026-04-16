/**
 * Demo users seed, idempotent by email.
 * Can run on service startup and as a one-off script.
 */
import { pool } from "./connection";
import { hashPassword } from "../utils/password";
import { UserRoleRepository } from "../repositories/userRoleRepository";
import type { RoleRow } from "../types/types";
import { upsertDirectorySeedEmployee } from "../client/directoryClient";

const DEMO_USERS: {
  employee_number: string;
  email: string;
  role_key: RoleRow["role_key"];
  password: string;
  full_name: string;
  department: string;
  title: string;
  employment_type: string;
  status: string;
  location: string;
  directory_role: string;
  company_key: string;
}[] = [
  { employee_number: "ADM-DEMO-01", email: "admin.demo@mail.com", role_key: "admin", password: "password", full_name: "Demo Administrator", department: "ESL_IT", title: "Administrator", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "admin", company_key: "ESL" },
  { employee_number: "HR-TZ-01", email: "hr.tz@mail.com", role_key: "HR", password: "password123", full_name: "HR Tanzania", department: "ESL_HR", title: "HR Officer", employment_type: "PERMANENT", status: "ACTIVE", location: "TZ_DAR_ES_SALAAM", directory_role: "HR", company_key: "ESL" },
  { employee_number: "HR-KE-01", email: "hr.ke@mail.com", role_key: "HR", password: "password123", full_name: "HR Kenya", department: "ESL_HR", title: "HR Officer", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "HR", company_key: "ESL" },
  { employee_number: "HR-UG-01", email: "hr.ug@mail.com", role_key: "HR", password: "password123", full_name: "HR Uganda", department: "ESL_HR", title: "HR Officer", employment_type: "PERMANENT", status: "ACTIVE", location: "UG_KAMPALA", directory_role: "HR", company_key: "ESL" },
  { employee_number: "HR-RW-01", email: "hr.rw@mail.com", role_key: "HR", password: "password123", full_name: "HR Rwanda", department: "ESL_HR", title: "HR Officer", employment_type: "PERMANENT", status: "ACTIVE", location: "RW_RWANDA", directory_role: "HR", company_key: "ESL" },
  { employee_number: "HOD-IT-01", email: "hod.it@mail.com", role_key: "hod", password: "password123", full_name: "HOD IT", department: "ESL_IT", title: "HOD", employment_type: "PERMANENT", status: "ACTIVE", location: "TZ_DAR_ES_SALAAM", directory_role: "hod", company_key: "ESL" },
  { employee_number: "HOD-FIN-01", email: "hod.finance@mail.com", role_key: "hod", password: "password123", full_name: "HOD Finance", department: "ESL_FINANCE", title: "HOD", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "hod", company_key: "ESL" },
  { employee_number: "HOD-AGY-01", email: "hod.agency@mail.com", role_key: "hod", password: "password123", full_name: "HOD Agency", department: "ESL_AGENCY", title: "HOD", employment_type: "PERMANENT", status: "ACTIVE", location: "UG_KAMPALA", directory_role: "hod", company_key: "ESL" },
  { employee_number: "EMP-TZ-01", email: "employee1.tz@mail.com", role_key: "employee", password: "password123", full_name: "Employee 1 Tanzania", department: "ESL_IT", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "TZ_DAR_ES_SALAAM", directory_role: "employee", company_key: "ESL" },
  { employee_number: "EMP-TZ-02", email: "employee2.tz@mail.com", role_key: "employee", password: "password123", full_name: "Employee 2 Tanzania", department: "ESL_IT", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "TZ_DAR_ES_SALAAM", directory_role: "employee", company_key: "ESL" },
  { employee_number: "EMP-KE-01", email: "employee1.ke@mail.com", role_key: "employee", password: "password123", full_name: "Employee 1 Kenya", department: "ESL_FINANCE", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "employee", company_key: "ESL" },
  { employee_number: "EMP-KE-02", email: "employee2.ke@mail.com", role_key: "employee", password: "password123", full_name: "Employee 2 Kenya", department: "ESL_FINANCE", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "employee", company_key: "ESL" },
  { employee_number: "EMP-UG-01", email: "employee1.ug@mail.com", role_key: "employee", password: "password123", full_name: "Employee 1 Uganda", department: "ESL_AGENCY", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "UG_KAMPALA", directory_role: "employee", company_key: "ESL" },
  { employee_number: "EMP-UG-02", email: "employee2.ug@mail.com", role_key: "employee", password: "password123", full_name: "Employee 2 Uganda", department: "ESL_AGENCY", title: "Employee", employment_type: "PERMANENT", status: "ACTIVE", location: "UG_KAMPALA", directory_role: "employee", company_key: "ESL" },
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

export async function seedDemoUsers(): Promise<void> {
  const userRoles = new UserRoleRepository();

  if (DEPRECATED_SEED_EMAILS.length > 0) {
    const { rows } = await pool.query<{ id: number }>(
      `SELECT id FROM users WHERE email = ANY($1::text[])`,
      [DEPRECATED_SEED_EMAILS]
    );
    const userIds = rows.map((row) => row.id);
    if (userIds.length > 0) {
      await pool.query(`DELETE FROM user_roles WHERE user_id = ANY($1::int[])`, [userIds]);
      await pool.query(`DELETE FROM users WHERE id = ANY($1::int[])`, [userIds]);
    }
  }

  for (const u of DEMO_USERS) {
    const email = u.email.toLowerCase();
    const password_hash = await hashPassword(u.password);

    const ins = await pool.query<{ id: number }>(
      `INSERT INTO users (employee_number, email, password_hash, status, is_active)
       VALUES ($1, $2, $3, 'ACTIVE', true)
       ON CONFLICT (email) DO UPDATE SET
         employee_number = EXCLUDED.employee_number,
         password_hash = EXCLUDED.password_hash,
         status = 'ACTIVE',
         is_active = true
       RETURNING id`,
      [u.employee_number, email, password_hash]
    );

    let userId = ins.rows[0]?.id;
    if (!userId) {
      const existing = await pool.query<{ id: number }>(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );
      userId = existing.rows[0]?.id;
    }

    if (!userId) {
      console.warn(`Skip ${email}: could not resolve user id`);
      continue;
    }

    await pool.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
    await userRoles.assignRole({ user_id: userId, role_key: u.role_key });
    console.log(`OK: ${email} (${u.role_key})`);

    const synced = await upsertDirectorySeedEmployee({
      employee_number: u.employee_number,
      full_name: u.full_name,
      email,
      department: u.department,
      title: u.title,
      employment_type: u.employment_type,
      status: u.status,
      location: u.location,
      directory_role: u.directory_role,
      company_key: u.company_key,
    });
    if (synced) {
      console.log(`Directory employee synced: ${email}`);
    }
  }
}

if (require.main === module) {
  seedDemoUsers()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
