import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import {
  createLeavePlan,
  listMyLeavePlans,
  updateLeavePlan,
  deleteLeavePlan,
  convertLeavePlan,
  getManagerPlannedLeaves,
} from "../controllers/leavePlanController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { staffOnly, supervisorOrAbove } from "@libs/rbac";

const router = Router();

router.post("/", authMiddleware, loadDirectoryRole, staffOnly, createLeavePlan);
router.get(
  "/my",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  listMyLeavePlans,
);
router.put(
  "/:id",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  updateLeavePlan,
);
router.delete(
  "/:id",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  deleteLeavePlan,
);
router.post(
  "/:id/convert",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  convertLeavePlan,
);
router.get(
  "/plans",
  authMiddleware,
  loadDirectoryRole,
  supervisorOrAbove,
  getManagerPlannedLeaves,
);

export default router;

