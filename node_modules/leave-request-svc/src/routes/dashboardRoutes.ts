import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import {
  getHrDashboard,
  getManagerDashboard,
  getManagerTeamLeaves,
  getMyDashboard,
} from "../controllers/dashboardController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { staffOnly, managerOnly, hrOrAdmin } from "@libs/rbac";

const router = Router();

router.get("/me", authMiddleware, loadDirectoryRole, staffOnly, getMyDashboard);

router.get(
  "/manager/summary",
  authMiddleware,
  loadDirectoryRole,
  managerOnly,
  getManagerDashboard
);

router.get(
  "/hr/summary",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  getHrDashboard
);

router.get(
  "/manager/team-leaves",
  authMiddleware,
  loadDirectoryRole,
  managerOnly,
  getManagerTeamLeaves
);

export default router;
