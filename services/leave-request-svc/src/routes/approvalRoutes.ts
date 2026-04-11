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

router.get(
  "/pending",
  authMiddleware,
  loadDirectoryRole,
  supervisorOrAbove,
  getMyPendingApprovals,
);

router.get(
  "/history",
  authMiddleware,
  loadDirectoryRole,
  supervisorOrAbove,
  getMyApprovalHistory,
);

router.get(
  "/request/:requestId",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getApprovalTrail,
);

router.post(
  "/:requestId/act",
  authMiddleware,
  loadDirectoryRole,
  supervisorOrAbove,
  actOnApproval,
);

export default router;
