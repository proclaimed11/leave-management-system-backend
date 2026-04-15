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
const auth = authMiddleware as any;
const staff = staffOnly as any;
const manager = managerOnly as any;
const hrAdmin = hrOrAdmin as any;

router.get("/me", auth, loadDirectoryRole, staff, getMyDashboard);

router.get(
  "/manager/summary",
  auth,
  loadDirectoryRole,
  manager,
  getManagerDashboard
);

router.get(
  "/hr/summary",
  auth,
  loadDirectoryRole,
  hrAdmin,
  getHrDashboard
);

router.get(
  "/manager/team-leaves",
  auth,
  loadDirectoryRole,
  manager,
  getManagerTeamLeaves
);

export default router;
