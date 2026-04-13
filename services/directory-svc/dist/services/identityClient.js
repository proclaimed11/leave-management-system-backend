"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardIdentityUser = onboardIdentityUser;
exports.deleteIdentityUserForEmployee = deleteIdentityUserForEmployee;
const axios_1 = __importDefault(require("axios"));
const IDENTITY_BASE_URL = process.env.IDENTITY_BASE_URL?.trim();
async function onboardIdentityUser(employee) {
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
        const response = await axios_1.default.post(`${IDENTITY_BASE_URL.replace(/\/$/, "")}/auth/internal/provision-user`, payload, {
            headers: {
                "X-Service-Auth": serviceToken,
                "Content-Type": "application/json",
            },
        });
        const d = response.data;
        if (d.temporary_password && typeof d.temporary_password === "string") {
            return { user_created: true, temporary_password: d.temporary_password };
        }
        return { user_created: false, error: "Identity response missing temporary_password" };
    }
    catch (err) {
        console.error("IDENTITY ONBOARD ERROR:", err.response?.data || err.message);
        return {
            user_created: false,
            error: err.response?.data ?? err.message,
        };
    }
}
/** After directory permanent-delete; removes matching `users` row in identity-svc. */
async function deleteIdentityUserForEmployee(params) {
    if (!IDENTITY_BASE_URL) {
        return { ok: false, error: "IDENTITY_BASE_URL is not configured" };
    }
    const serviceToken = process.env.SERVICE_AUTH_TOKEN?.trim();
    if (!serviceToken) {
        return { ok: false, error: "SERVICE_AUTH_TOKEN is not configured" };
    }
    try {
        const response = await axios_1.default.post(`${IDENTITY_BASE_URL.replace(/\/$/, "")}/auth/internal/delete-user-for-employee`, {
            email: params.email,
            employee_number: params.employee_number,
        }, {
            headers: {
                "X-Service-Auth": serviceToken,
                "Content-Type": "application/json",
            },
        });
        const d = response.data;
        return { ok: true, deleted: Boolean(d.deleted) };
    }
    catch (err) {
        console.error("IDENTITY DELETE USER ERROR:", err.response?.data || err.message);
        return {
            ok: false,
            error: err.response?.data ?? err.message,
        };
    }
}
