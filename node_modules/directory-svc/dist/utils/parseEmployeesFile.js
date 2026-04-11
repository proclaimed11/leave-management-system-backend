"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmployeesBuffer = parseEmployeesBuffer;
const XLSX = __importStar(require("xlsx"));
async function parseEmployeesBuffer(file) {
    const buffer = file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const parsed = rows.map((row) => ({
        employee_number: row["employee_number"]?.toString().trim(),
        full_name: row["full_name"]?.toString().trim(),
        email: row["email"]?.toString().trim(),
        department: row["department"]?.toString().trim() || null,
        title: row["title"]?.toString().trim() || null,
        status: row["status"]?.toString().trim() || "active",
        manager_employee_number: row["manager_employee_number"]?.toString().trim() || null,
        phone: row["phone"]?.toString().trim() || null,
        address: row["address"]?.toString().trim() || null,
        emergency_contact_name: row["emergency_contact_name"]?.toString().trim() || null,
        emergency_contact_phone: row["emergency_contact_phone"]?.toString().trim() || null,
        marital_status: row["marital_status"]?.toString().trim() || null,
        date_of_birth: row["date_of_birth"]?.toString().trim() || null
    }));
    return parsed;
}
