import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin, staffOnly } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { resolveEmployeeVisibilityScope } from "../middleware/employeeVisibilityScope";

import {
  createEmployee,
  listEmployees,
  getMyProfile,
  updateMyProfile,
  getEmployeeById,
  updateEmployee,
  listManagerCandidates,
} from "../controllers/employeeController";
import { uploadEmployeeAvatar } from "../controllers/employeeAvatarController";
import {
  archiveEmployee,
  permanentDeleteEmployee,
  restoreEmployee,
} from "../controllers/employeeArchiveController";
import { avatarUpload } from "../middleware/avatarUpload";
import { listStatuses } from "../controllers/statusController";

const router = Router();

router.post("/", authMiddleware, loadDirectoryRole, hrOrAdmin, createEmployee);

router.get("/", authMiddleware, loadDirectoryRole, staffOnly, resolveEmployeeVisibilityScope, listEmployees);

router.get("/me", authMiddleware, loadDirectoryRole, hrOrAdmin, getMyProfile);
router.put("/me", authMiddleware, loadDirectoryRole, hrOrAdmin, updateMyProfile);

router.get("/statuses", authMiddleware, loadDirectoryRole, hrOrAdmin, listStatuses);
router.get(
  "/manager-candidates",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  listManagerCandidates
);

router.post(
  "/:employee_number/avatar",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  avatarUpload.single("file") as any,
  uploadEmployeeAvatar
);

router.get(
  "/:employee_number",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  resolveEmployeeVisibilityScope,
  getEmployeeById
);
router.put("/:employee_number", authMiddleware, loadDirectoryRole, hrOrAdmin, updateEmployee);

router.put(
  "/:employee_number/archive",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  archiveEmployee
);

router.put(
  "/:employee_number/restore",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  restoreEmployee
);

router.delete(
  "/:employee_number/permanent",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  permanentDeleteEmployee
);

export default router;
