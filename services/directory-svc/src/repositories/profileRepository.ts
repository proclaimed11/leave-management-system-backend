import { pool } from "../db/connection";
import { EmployeeProfile, UpdateMyProfileDTO } from "../types/profile";

export class ProfileRepository {


  async getByEmployeeNumber(
    employeeNumber: string,
  ): Promise<EmployeeProfile | null> {

    const res = await pool.query(
      `
      SELECT
        e.employee_number,
        e.full_name,
        e.email,
        e.title,
        e.department,
        e.location,
        e.employment_type,
        e.directory_role,
        e.company_key,
        e.status,
        e.avatar_url,
        e.phone,
        e.address,
        e.country,
        e.gender,
        e.marital_status,
        e.date_of_birth,
        e.hire_date,
        e.termination_date,
        e.created_at,
        e.emergency_contact_name,
        e.emergency_contact_phone,

        m.employee_number AS manager_employee_number,
        m.full_name AS manager_full_name

      FROM employees e
      LEFT JOIN employees m
        ON m.employee_number = e.manager_employee_number

      WHERE e.employee_number = $1
      `,
      [employeeNumber],
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      employee_number: row.employee_number,
      full_name: row.full_name,
      email: row.email,
      title: row.title,
      department: row.department,
      location: row.location,
      employment_type: row.employment_type,
      directory_role: row.directory_role,
      company_key: row.company_key,
      status: row.status,
      avatar_url: row.avatar_url ?? null,
      phone: row.phone,
      address: row.address,
      country: row.country,
      gender: row.gender,
      marital_status: row.marital_status,
      date_of_birth: row.date_of_birth,
      hire_date: row.hire_date,
      termination_date: row.termination_date,
      created_at: row.created_at,
      emergency_contact_name: row.emergency_contact_name,
      emergency_contact_phone: row.emergency_contact_phone,
      manager: row.manager_employee_number
        ? {
            employee_number: row.manager_employee_number,
            full_name: row.manager_full_name,
          }
        : null,
    };
  }

  async updateSelfProfile(
    employeeNumber: string,
    data: UpdateMyProfileDTO,
  ): Promise<EmployeeProfile | null> {

    await pool.query(
      `
      UPDATE employees
      SET
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        country = COALESCE($4, country),
        marital_status = COALESCE($5, marital_status),
        emergency_contact_name = COALESCE($6, emergency_contact_name),
        emergency_contact_phone = COALESCE($7, emergency_contact_phone),
        date_of_birth = COALESCE($8, date_of_birth)
      WHERE employee_number = $1
      `,
      [
        employeeNumber,
        data.phone ?? null,
        data.address ?? null,
        data.country ?? null,
        data.marital_status ?? null,
        data.emergency_contact_name ?? null,
        data.emergency_contact_phone ?? null,
        data.date_of_birth ?? null,
      ],
    );

    return this.getByEmployeeNumber(employeeNumber);
  }
}
