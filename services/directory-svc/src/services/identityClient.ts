import axios from "axios";

const IDENTITY_BASE_URL = process.env.IDENTITY_BASE_URL?.trim();

export type IdentityOnboardResult =
  | { user_created: true; temporary_password: string }
  | { user_created: false; error: unknown };

export type IdentityDeleteUserResult =
  | { ok: true; deleted: boolean }
  | { ok: false; error: unknown };

function stringifyIdentityError(err: any): string {
  const status = err?.response?.status;
  const body = err?.response?.data;
  const code = err?.code;
  const msg = err?.message;
  return [status ? `status=${status}` : "", code ? `code=${code}` : "", msg ?? "", body ? JSON.stringify(body) : ""]
    .filter(Boolean)
    .join(" | ");
}

export async function assertIdentityReady(): Promise<void> {
  if (!IDENTITY_BASE_URL) {
    throw new Error("IDENTITY_BASE_URL is not configured");
  }
  const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
  if (!serviceToken) {
    throw new Error("SERVICE_AUTH_TOKEN is not configured");
  }

  const maxWaitMs = Number(process.env.IDENTITY_BOOT_MAX_WAIT_MS || 30000);
  const startedAt = Date.now();
  let lastErr = "";

  while (Date.now() - startedAt < maxWaitMs) {
    try {
      const response = await axios.post(
        `${IDENTITY_BASE_URL.replace(/\/$/, "")}/auth/internal/provision-user`,
        {},
        {
          headers: {
            "X-Service-Auth": serviceToken,
            "Content-Type": "application/json",
          },
          timeout: 4000,
          validateStatus: () => true,
        }
      );

      if (response.status === 422 || response.status === 201 || response.status === 409) {
        return;
      }

      if (response.status === 403) {
        throw new Error("Identity reachable but SERVICE_AUTH_TOKEN is invalid");
      }

      lastErr = `Unexpected identity response status=${response.status}`;
    } catch (err: any) {
      lastErr = stringifyIdentityError(err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(
    `Identity service is not ready after ${maxWaitMs}ms. ${lastErr}`.trim()
  );
}

export async function onboardIdentityUser(employee: {
  employee_number: string;
  email: string;
  password?: string;
  must_change_password?: boolean;
  allow_existing?: boolean;
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
      password: employee.password,
      must_change_password: employee.must_change_password,
      allow_existing: employee.allow_existing,
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
    console.error("IDENTITY ONBOARD ERROR:", stringifyIdentityError(err));
    return {
      user_created: false,
      error: err.response?.data ?? err.message ?? err?.code,
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
    console.error("IDENTITY DELETE USER ERROR:", stringifyIdentityError(err));
    return {
      ok: false,
      error: err.response?.data ?? err.message,
    };
  }
}
