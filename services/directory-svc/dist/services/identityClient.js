"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardIdentityUser = onboardIdentityUser;
const axios_1 = __importDefault(require("axios"));
const IDENTITY_BASE_URL = process.env.IDENTITY_BASE_URL;
async function onboardIdentityUser(employee) {
    try {
        const payload = {
            employee_id: employee.id,
            employee_number: employee.employee_number,
            email: employee.email,
            role: "user",
        };
        const response = await axios_1.default.post(`${IDENTITY_BASE_URL}/auth/internal/provision-user`, payload, {
            headers: {
                "X-Service-Auth": process.env.SERVICE_AUTH_TOKEN,
                "Content-Type": "application/json",
            },
        });
        return response.data; // includes temp password
    }
    catch (err) {
        console.error("IDENTITY ONBOARD ERROR:", err.response?.data || err.message);
        return {
            user_created: false,
            error: err.response?.data || err.message,
        };
    }
}
