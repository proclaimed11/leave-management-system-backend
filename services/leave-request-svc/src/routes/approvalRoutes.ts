import { Router } from "express";
import {
  getMyPendingApprovals,
  getApprovalTrail,
  actOnApproval,
  getMyApprovalHistory,
} from "../controllers/leaveApprovalController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { supervisorOrAbove, staffOnly } from "@libs/rbac";
import { authMiddleware } from "@libs/auth-jwt";

const router = Router();
const auth = authMiddleware as any;
const staff = staffOnly as any;
const supervisor = supervisorOrAbove as any;

router.get(
  "/pending",
  auth,
  loadDirectoryRole,
  supervisor,
  getMyPendingApprovals,
);

router.get(
  "/history",
  auth,
  loadDirectoryRole,
  supervisor,
  getMyApprovalHistory,
);

router.get(
  "/request/:requestId",
  auth,
  loadDirectoryRole,
  staff,
  getApprovalTrail,
);

router.post(
  "/:requestId/act",
  auth,
  loadDirectoryRole,
  supervisor,
  actOnApproval,
);

export default router;
