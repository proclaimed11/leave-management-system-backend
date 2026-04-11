
export function validateCreateEmployee(body: any) {
  //Added the extra fields to validate the create employee request
  const required = ["employee_number", "full_name", "email","department","title","phone","gender"];

  for (const field of required) {
    if (!body[field]) {
      throw new Error(`${field} is required`);
    }
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw new Error("Invalid email format");
  }

  //added employee number format validation
  if(body.employee_number){
    const employeeNumber = String(body.employee_number).trim().toUpperCase();
    const EMPLOYEE_NUMBER_REGEX = /^[A-Z0-9]+-\d+$/;
    if(!EMPLOYEE_NUMBER_REGEX.test(employeeNumber)){
      throw new Error("Invalid employee number format");
    }
  }
}

export function validateStatus(status: string) {
  const allowed = ["active", "terminated", "on_leave", "probation", "suspended"];
  if (!allowed.includes(status)) {
    throw new Error("Invalid status value");
  }
}

export function validateEmail(email?: string) {
  if (!email) return;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) throw new Error("Invalid email format");
}

export function validateManager(manager?: string | null) {
  if (manager && typeof manager !== "string") {
    throw new Error("Invalid manager_employee_number");
  }
}
