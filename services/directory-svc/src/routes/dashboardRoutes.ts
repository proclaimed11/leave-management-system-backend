import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { requireDirectoryRole } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { resolveEmployeeVisibilityScope } from "../middleware/employeeVisibilityScope";
import {
  getCountryDashboardOverview,
  getDashboardOverview,
} from "../controllers/dashboardController";

const router = Router();
const overviewRoles = requireDirectoryRole(["hr", "admin", "management"]);

router.get(
  "/overview",
  authMiddleware,
  loadDirectoryRole,
  overviewRoles,
  getDashboardOverview
);

router.get(
  "/overview/country",
  authMiddleware,
  loadDirectoryRole,
  overviewRoles,
  resolveEmployeeVisibilityScope,
  getCountryDashboardOverview
);

export default router;
