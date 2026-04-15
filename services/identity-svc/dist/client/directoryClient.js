"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectoryEmployee = getDirectoryEmployee;
exports.upsertDirectorySeedEmployee = upsertDirectorySeedEmployee;
const axios_1 = __importDefault(require("axios"));
const DIRECTORY_BASE_URL = process.env.DIRECTORY_SVC_URL;
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;
async function getDirectoryEmployee(params) {
    console.log("Directory Client Params:", params);
    if (!params.employee_number && !params.email) {
        throw new Error("employee_number or email is required");
    }
    const r = await axios_1.default.get(`${DIRECTORY_BASE_URL}/internal/employees/employee`, {
        params,
        headers: {
            "x-internal-key": INTERNAL_KEY,
        },
    });
    return r.data;
}
/**
 * Best-effort sync: upsert a demo employee into directory-svc.
 * Returns false when directory integration is not configured or call fails.
 */
async function upsertDirectorySeedEmployee(payload) {
    if (!DIRECTORY_BASE_URL || !INTERNAL_KEY) {
        return false;
    }
    const url = `${DIRECTORY_BASE_URL.replace(/\/$/, "")}/internal/employees/seed-upsert-employee`;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            await axios_1.default.post(url, payload, {
                headers: {
                    "x-internal-key": INTERNAL_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 5000,
            });
            return true;
        }
        catch (err) {
            const status = err?.response?.status;
            const shouldRetry = !status || status >= 500 || err?.code === "ECONNREFUSED" || err?.code === "ECONNABORTED";
            if (!shouldRetry || attempt === 5) {
                console.warn("Directory seed upsert failed:", err?.response?.data || err?.message || err);
                return false;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
    return false;
}
