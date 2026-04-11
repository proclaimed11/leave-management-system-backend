"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryApi = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = process.env.DIRECTORY_SVC_URL || "http://localhost:3002";
class DirectoryApi {
    async getEmployee(empNo, authHeader) {
        const res = await axios_1.default.get(`${BASE_URL}/employees/${empNo}`, { headers: authHeader ? { Authorization: authHeader } : undefined });
        return res.data;
    }
    async getEmployeesByDepartment(department, authHeader) {
        const res = await axios_1.default.get(`${BASE_URL}/department/${department}`, { headers: authHeader ? { Authorization: authHeader } : undefined });
        return res.data.employees;
    }
    async getAllEmployees(authHeader) {
        const res = await axios_1.default.get(`${BASE_URL}/employees`, { headers: authHeader ? { Authorization: authHeader } : undefined });
        return res.data.employees;
    }
}
exports.DirectoryApi = DirectoryApi;
