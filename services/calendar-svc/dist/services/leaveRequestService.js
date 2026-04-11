"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestApi = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = process.env.LEAVE_REQUEST_SVC_URL || "http://localhost:3003";
class LeaveRequestApi {
    async getApprovedLeavesByMonth(year_month, authHeader) {
        const res = await axios_1.default.get(`${BASE_URL}/internal/approved/${year_month}`, { headers: authHeader ? { Authorization: authHeader } : undefined });
        return res.data.leaves;
    }
    async getApprovedLeavesForDepartment(department, authHeader) {
        const res = await axios_1.default.get(`${BASE_URL}/internal/department-approved/${department}`, { headers: authHeader ? { Authorization: authHeader } : undefined });
        return res.data.leaves;
    }
}
exports.LeaveRequestApi = LeaveRequestApi;
