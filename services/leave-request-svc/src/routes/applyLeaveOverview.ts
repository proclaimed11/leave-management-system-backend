import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { staffOnly } from "@libs/rbac";
import { getApplyLeaveOverview } from "../controllers/applyLeaveOverviewController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

const router = Router();

router.get(
  "/leave-overview",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getApplyLeaveOverview
);

export default router;
