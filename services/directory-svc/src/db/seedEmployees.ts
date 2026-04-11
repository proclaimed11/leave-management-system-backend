import { pool } from "./connection";

async function seedEmployees() {
  try {
    console.log("🌱 Seeding employees...");

    const query = `
      INSERT INTO employees 
        (employee_number, full_name, email, department, title, status, manager_employee_number)
      VALUES
        ('ESL-001', 'Dorcas Cherono', 'dorcas@esl.com', 'Tech', 'Software Engineer', 'active', 'ESL-010'),
        ('ESL-002', 'Kelvin Mosonik', 'kelvin@esl.com', 'Finance', 'Accountant', 'active', 'ESL-020'),
        ('ESL-003', 'Brian Mwangi', 'brian@esl.com', 'Tech', 'DevOps Engineer', 'active', 'ESL-010'),
        ('ESL-004', 'Sarah Njeri', 'sarah@esl.com', 'HR', 'HR Officer', 'active', 'ESL-050'),
        ('ESL-010', 'James Kariuki', 'james@esl.com', 'Tech', 'Engineering Manager', 'active', 'ESL-050'),
        ('ESL-020', 'Cynthia Wambui', 'cynthia@esl.com', 'Finance', 'Finance Manager', 'active', 'ESL-050'),
        ('ESL-050', 'Grace Mutheu', 'grace@esl.com', 'HR', 'HR Manager', 'active', NULL)
      ON CONFLICT (employee_number) DO NOTHING;
    `;

    await pool.query(query);

    console.log("Employee seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding employees:", err);
    process.exit(1);
  }
}

seedEmployees();
