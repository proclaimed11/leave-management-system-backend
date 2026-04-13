"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEmployeeAvatar = void 0;
const fs_1 = __importDefault(require("fs"));
const uploadPaths_1 = require("../config/uploadPaths");
const employeeRepository_1 = require("../repositories/employeeRepository");
const avatarFileCleanup_1 = require("../utils/avatarFileCleanup");
const repo = new employeeRepository_1.EmployeeRepository();
const uploadEmployeeAvatar = async (req, res) => {
    try {
        const { employee_number } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "No image file received (use field name \"file\")" });
            return;
        }
        const existing = await repo.findByEmployeeNumber(employee_number);
        if (!existing) {
            try {
                fs_1.default.unlinkSync(file.path);
            }
            catch {
                /* ignore */
            }
            res.status(404).json({ error: "Employee not found" });
            return;
        }
        const relativePath = (0, uploadPaths_1.publicAvatarPath)(file.filename);
        (0, avatarFileCleanup_1.tryRemoveStoredAvatar)(existing.avatar_url);
        const updated = await repo.updateAvatarUrl(employee_number, relativePath);
        if (!updated) {
            try {
                fs_1.default.unlinkSync(file.path);
            }
            catch {
                /* ignore */
            }
            res.status(500).json({ error: "Failed to update employee avatar" });
            return;
        }
        res.json({
            message: "Avatar updated",
            avatar_url: relativePath,
            employee: updated,
        });
    }
    catch (err) {
        if (req.file?.path) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch {
                /* ignore */
            }
        }
        res.status(400).json({ error: err.message ?? "Upload failed" });
    }
};
exports.uploadEmployeeAvatar = uploadEmployeeAvatar;
