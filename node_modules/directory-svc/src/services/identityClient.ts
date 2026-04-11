import axios from "axios";

const IDENTITY_BASE_URL = process.env.IDENTITY_BASE_URL;

export async function onboardIdentityUser(employee: any) {
  try {
    const payload = {
      employee_id: employee.id,
      employee_number: employee.employee_number,
      email: employee.email,
      role: "user",
    };
    const response = await axios.post(
      `${IDENTITY_BASE_URL}/auth/internal/provision-user`,
      payload,
      {
        headers: {
          "X-Service-Auth": process.env.SERVICE_AUTH_TOKEN!,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // includes temp password
  } catch (err: any) {
    console.error("IDENTITY ONBOARD ERROR:", err.response?.data || err.message);
    return {
      user_created: false,
      error: err.response?.data || err.message,
    };
  }
}
