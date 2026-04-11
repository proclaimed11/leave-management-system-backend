import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

import {
  createEmployee,
  listEmployees,
  getMyProfile,
  updateMyProfile,
  getEmployeeById,
  updateEmployee,
  listManagerCandidates,
} from "../controllers/employeeController";
import { archiveEmployee } from "../controllers/employeeArchiveController";
import { listStatuses } from "../controllers/statusController";

const router = Router();

router.post("/", authMiddleware, loadDirectoryRole, hrOrAdmin, createEmployee);

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listEmployees);

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

router.get("/:employee_number", authMiddleware, loadDirectoryRole, hrOrAdmin, getEmployeeById);
router.put("/:employee_number", authMiddleware, loadDirectoryRole, hrOrAdmin, updateEmployee);

router.put(
  "/:employee_number/archive",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  archiveEmployee
);

export default router;
