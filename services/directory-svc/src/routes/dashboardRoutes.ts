import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { getDashboardOverview } from "../controllers/dashboardController";

const router = Router();

router.get(
  "/overview",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  getDashboardOverview
);

export default router;
