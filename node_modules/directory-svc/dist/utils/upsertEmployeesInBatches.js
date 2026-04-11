"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEmployeesInBatches = upsertEmployeesInBatches;
async function upsertEmployeesInBatches(client, rows, batchSize = 200) {
    const inserted = [];
    const updated = [];
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const values = [];
        const placeholders = batch
            .map((r, idx) => {
            const base = idx * 15;
            values.push(r.employee_number, r.full_name, r.email, r.department ?? null, r.title ?? null, r.status ?? "active", r.manager_employee_number ?? null, r.phone ?? null, r.address ?? null, r.city ?? null, r.county ?? null, r.emergency_contact_name ?? null, r.emergency_contact_phone ?? null, r.marital_status ?? null, r.date_of_birth ?? null);
            return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},
                 $${base + 6},$${base + 7},$${base + 8},$${base + 9},$${base + 10},
                 $${base + 11},$${base + 12},$${base + 13},$${base + 14},$${base + 15})`;
        })
            .join(",");
        const sql = `
      INSERT INTO employees (
        employee_number, full_name, email, department, title, status,
        manager_employee_number, phone, address, city, county,
        emergency_contact_name, emergency_contact_phone, marital_status, date_of_birth
      )
      VALUES ${placeholders}
      ON CONFLICT (employee_number)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        department = EXCLUDED.department,
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        manager_employee_number = EXCLUDED.manager_employee_number,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        county = EXCLUDED.county,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        marital_status = EXCLUDED.marital_status,
        date_of_birth = EXCLUDED.date_of_birth
      RETURNING 
        (xmax = 0) AS inserted_flag,
        employee_number
    `;
        const result = await client.query(sql, values);
        result.rows.forEach((r, idx) => {
            const row = batch[idx];
            if (r.inserted_flag)
                inserted.push(row);
            else
                updated.push(row);
        });
    }
    return { inserted, updated };
}
