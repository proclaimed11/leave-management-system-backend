"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoUsers = seedDemoUsers;
/**
 * Demo users seed, idempotent by email.
 * Can run on service startup and as a one-off script.
 */
const connection_1 = require("./connection");
const password_1 = require("../utils/password");
const userRoleRepository_1 = require("../repositories/userRoleRepository");
const directoryClient_1 = require("../client/directoryClient");
const DEMO_USERS = [
    { employee_number: "ADM-DEMO-01", email: "admin.demo@mail.com", role_key: "admin", password: "password", full_name: "Demo Administrator", department: "ESL_IT", title: "Administrator", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "admin", company_key: "ESL" },
    { employee_number: "HR-DEMO-01", email: "hr.demo@mail.com", role_key: "HR", password: "password123", full_name: "Demo HR Officer", department: "ESL_HR", title: "HR Officer", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "HR", company_key: "ESL" },
    { employee_number: "EMP-DEMO-01", email: "employee.demo@mail.com", role_key: "employee", password: "password123", full_name: "Demo Employee", department: "ESL_AGENCY", title: "Agent", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "employee", company_key: "ESL" },
    { employee_number: "SUP-DEMO-01", email: "supervisor.demo@mail.com", role_key: "supervisor", password: "password123", full_name: "Demo Supervisor", department: "ESL_TECH", title: "Team Lead", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "supervisor", company_key: "ESL" },
    { employee_number: "HOD-DEMO-01", email: "hod.demo@mail.com", role_key: "hod", password: "password123", full_name: "Demo Head of Department", department: "ESL_QHSSE", title: "HOD", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "hod", company_key: "ESL" },
    { employee_number: "MGT-DEMO-01", email: "management.demo@mail.com", role_key: "management", password: "password123", full_name: "Demo Management", department: "ESL_EXCOM", title: "Executive", employment_type: "PERMANENT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "management", company_key: "ESL" },
    { employee_number: "CON-DEMO-01", email: "consultant.demo@mail.com", role_key: "consultant", password: "password123", full_name: "Demo Consultant", department: "ESL_AUDIT", title: "Consultant", employment_type: "CONTRACT", status: "ACTIVE", location: "KE_MOMBASA", directory_role: "consultant", company_key: "ESL" },
];
async function seedDemoUsers() {
    const userRoles = new userRoleRepository_1.UserRoleRepository();
    for (const u of DEMO_USERS) {
        const email = u.email.toLowerCase();
        const password_hash = await (0, password_1.hashPassword)(u.password);
        const ins = await connection_1.pool.query(`INSERT INTO users (employee_number, email, password_hash, status, is_active)
       VALUES ($1, $2, $3, 'ACTIVE', true)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`, [u.employee_number, email, password_hash]);
        let userId = ins.rows[0]?.id;
        if (!userId) {
            const existing = await connection_1.pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
            userId = existing.rows[0]?.id;
        }
        if (!userId) {
            console.warn(`Skip ${email}: could not resolve user id`);
            continue;
        }
        await userRoles.assignRole({ user_id: userId, role_key: u.role_key });
        console.log(`OK: ${email} (${u.role_key})`);
        const synced = await (0, directoryClient_1.upsertDirectorySeedEmployee)({
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
        .finally(() => connection_1.pool.end());
}
