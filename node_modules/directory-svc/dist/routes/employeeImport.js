"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_jwt_1 = require("@libs/auth-jwt");
const rbac_1 = require("@libs/rbac");
const loadDirectoryRole_1 = require("../middleware/loadDirectoryRole");
const employeeImportController_1 = require("../controllers/employeeImportController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/importEmployees/preview", auth_jwt_1.authMiddleware, loadDirectoryRole_1.loadDirectoryRole, rbac_1.hrOrAdmin, upload.single("file"), employeeImportController_1.previewEmployeeImport);
router.post("/importEmployees/commit", auth_jwt_1.authMiddleware, loadDirectoryRole_1.loadDirectoryRole, rbac_1.hrOrAdmin, upload.single("file"), employeeImportController_1.commitEmployeeImport);
exports.default = router;
