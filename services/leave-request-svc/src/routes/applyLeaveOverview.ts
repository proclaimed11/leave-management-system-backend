import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { staffOnly } from "@libs/rbac";
import { getApplyLeaveOverview } from "../controllers/applyLeaveOverviewController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

const router = Router();
const auth = authMiddleware as any;
const staff = staffOnly as any;

router.get(
  "/leave-overview",
  auth,
  loadDirectoryRole,
  staff,
  getApplyLeaveOverview
);

export default router;
