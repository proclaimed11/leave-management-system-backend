import { Request, Response } from "express";
import { IdentityEngine } from "../services/identityEngine";
import { validateRegisterInput } from "../validators/authValidator";

const engine = new IdentityEngine();

/* ============================================================
   REGISTER (Local users)
   ============================================================ */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const data = validateRegisterInput(req);

    const user = await engine.registerLocalUser({
      employee_number: data.employee_number ?? null,
      email: data.email,
      password: data.password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        employee_number: user.employee_number,
        email: user.email,
      },
    });
  } catch (err: any) {
    const msg = String(err?.message ?? "Registration failed");

    const status =
      /already exists/i.test(msg) ? 409 :
      /required|invalid/i.test(msg) ? 422 :
      500;

    return res.status(status).json({ error: msg });
  }
};

/* ============================================================
   LOGIN WITH PASSWORD (Local)
   ============================================================ */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    const result = await engine.loginWithPassword({
      email: String(email ?? ""),
      password: String(password ?? ""),
    });

    return res.json({
      message: "Login successful",
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(401).json({ error: err.message || "Invalid credentials" });
  }
};

/* ============================================================
   LOGIN WITH SSO (Azure AD)
   Middleware before this sets req.verifiedEmail
   ============================================================ */
export const loginWithSso = async (req: Request, res: Response) => {
  try {
    const verifiedEmail = (req as any).verifiedEmail;

    if (!verifiedEmail) {
      return res.status(400).json({ error: "No verified email provided" });
    }

    const result = await engine.loginWithSso(String(verifiedEmail));

    return res.json({
      message: "SSO login successful",
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err: any) {
    console.error("SSO Login error:", err);
    return res.status(401).json({ error: err.message || "SSO login failed" });
  }
};

/* ============================================================
   GET ME (decode token)
   ============================================================ */
export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const jwtUser = await engine.getCurrentUserFromAuthHeader(authHeader);
    const user = await engine.mergeMustChangePasswordFromDb(jwtUser);

    return res.json({
      message: "Authenticated user",
      user,
    });
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* ============================================================
   REFRESH TOKEN
   ============================================================ */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body ?? {};

    if (!refresh_token) {
      return res.status(400).json({ error: "refresh_token is required" });
    }

    const result = await engine.refreshAccessToken(String(refresh_token));

    return res.json({
      message: "Token refreshed",
      token: result.token,
      refresh_token: result.refresh_token,
    });
  } catch (err: any) {
    console.error("Refresh token error:", err);
    return res.status(401).json({ error: err.message || "Refresh failed" });
  }
};

/* ============================================================
   LOGOUT (revoke one refresh token)
   ============================================================ */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body ?? {};

    if (!refresh_token) {
      return res.status(400).json({ error: "refresh_token is required" });
    }

    await engine.logout(String(refresh_token));

    return res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    console.error("Logout error:", err);
    return res.status(400).json({ error: err.message || "Logout failed" });
  }
};

/* ============================================================
   LOGOUT ALL (revoke all refresh tokens for current user)
   ============================================================ */
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const currentUser = await engine.getCurrentUserFromAuthHeader(authHeader);

    // JwtUser uses `sub` for identity user id
    await engine.logoutAll(currentUser.sub);

    return res.json({ message: "Logged out from all devices" });
  } catch (err: any) {
    console.error("Logout-all error:", err);
    return res.status(401).json({ error: err.message || "Logout-all failed" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const currentUser = await engine.getCurrentUserFromAuthHeader(authHeader);

    const current_password = String(req.body?.current_password ?? "");
    const new_password = String(req.body?.new_password ?? "");

    const result = await engine.changePassword(
      currentUser.sub,
      current_password,
      new_password
    );

    return res.json({
      message: "Password updated",
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err: any) {
    const msg = String(err?.message ?? "Password change failed");
    const status =
      /incorrect|not available/i.test(msg) ? 401 : /at least 8/i.test(msg) ? 422 : 400;
    return res.status(status).json({ error: msg });
  }
};
