"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-off dev seed: six users (HR, employee, supervisor, hod, management, consultant)
 * with password "password123", each linked to the matching role_key in `roles`.
 *
 * Run: npm run seed:demo-users
 * Requires .env with valid DB_* (same as the service).
 */
const connection_1 = require("./connection");
const password_1 = require("../utils/password");
const userRoleRepository_1 = require("../repositories/userRoleRepository");
const PASSWORD = "password123";
const DEMO_USERS = [
    { employee_number: "HR-DEMO-01", email: "hr.demo@mail.com", role_key: "HR" },
    { employee_number: "EMP-DEMO-01", email: "employee.demo@mail.com", role_key: "employee" },
    { employee_number: "SUP-DEMO-01", email: "supervisor.demo@mail.com", role_key: "supervisor" },
    { employee_number: "HOD-DEMO-01", email: "hod.demo@mail.com", role_key: "hod" },
    { employee_number: "MGT-DEMO-01", email: "management.demo@mail.com", role_key: "management" },
    { employee_number: "CON-DEMO-01", email: "consultant.demo@mail.com", role_key: "consultant" },
];
async function main() {
    const userRoles = new userRoleRepository_1.UserRoleRepository();
    const password_hash = await (0, password_1.hashPassword)(PASSWORD);
    for (const u of DEMO_USERS) {
        const email = u.email.toLowerCase();
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
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exitCode = 1;
})
    .finally(() => connection_1.pool.end());
