import axios from "axios";

const IDENTITY_BASE_URL = process.env.IDENTITY_BASE_URL?.trim();

export type IdentityOnboardResult =
  | { user_created: true; temporary_password: string }
  | { user_created: false; error: unknown };

export type IdentityDeleteUserResult =
  | { ok: true; deleted: boolean }
  | { ok: false; error: unknown };

export async function onboardIdentityUser(employee: {
  employee_number: string;
  email: string;
}): Promise<IdentityOnboardResult> {
  if (!IDENTITY_BASE_URL) {
    return { user_created: false, error: "IDENTITY_BASE_URL is not configured" };
  }
  const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
  if (!serviceToken) {
    return { user_created: false, error: "SERVICE_AUTH_TOKEN is not configured" };
  }

  try {
    const payload = {
      employee_number: employee.employee_number,
      email: employee.email,
    };
    const response = await axios.post(
      `${IDENTITY_BASE_URL.replace(/\/$/, "")}/auth/internal/provision-user`,
      payload,
      {
        headers: {
          "X-Service-Auth": serviceToken,
          "Content-Type": "application/json",
        },
      }
    );

    const d = response.data as {
      user_created?: boolean;
      temporary_password?: string;
    };
    if (d.temporary_password && typeof d.temporary_password === "string") {
      return { user_created: true, temporary_password: d.temporary_password };
    }
    return { user_created: false, error: "Identity response missing temporary_password" };
  } catch (err: any) {
    console.error("IDENTITY ONBOARD ERROR:", err.response?.data || err.message);
    return {
      user_created: false,
      error: err.response?.data ?? err.message,
    };
  }
}

/** After directory permanent-delete; removes matching `users` row in identity-svc. */
export async function deleteIdentityUserForEmployee(params: {
  email: string;
  employee_number: string;
}): Promise<IdentityDeleteUserResult> {
  if (!IDENTITY_BASE_URL) {
    return { ok: false, error: "IDENTITY_BASE_URL is not configured" };
  }
  const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
  if (!serviceToken) {
    return { ok: false, error: "SERVICE_AUTH_TOKEN is not configured" };
  }

  try {
    const response = await axios.post(
      `${IDENTITY_BASE_URL.replace(/\/$/, "")}/auth/internal/delete-user-for-employee`,
      {
        email: params.email,
        employee_number: params.employee_number,
      },
      {
        headers: {
          "X-Service-Auth": serviceToken,
          "Content-Type": "application/json",
        },
      }
    );

    const d = response.data as { deleted?: boolean };
    return { ok: true, deleted: Boolean(d.deleted) };
  } catch (err: any) {
    console.error("IDENTITY DELETE USER ERROR:", err.response?.data || err.message);
    return {
      ok: false,
      error: err.response?.data ?? err.message,
    };
  }
}
