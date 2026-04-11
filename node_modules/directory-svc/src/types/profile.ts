export interface EmployeeProfile {
  employee_number: string;
  full_name: string;
  email: string;
  title: string | null;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  directory_role: string;
  company_key: string;
  status: string;

  phone: string | null;
  address: string | null;
  country: string | null;
  gender: string | null;
  marital_status: string | null;
  date_of_birth: string | null;
  hire_date: string | null;
  termination_date: string | null;
  created_at: string;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;

  manager: {
    employee_number: string;
    full_name: string;
  } | null;
}


export interface UpdateMyProfileDTO {
  phone?: string;
  address?: string;
  country?: string;
  marital_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  date_of_birth?: string;
}

