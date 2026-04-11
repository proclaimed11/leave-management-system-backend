"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectoryEmployee = getDirectoryEmployee;
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
