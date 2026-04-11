import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import {
  applyLeave,
  getMyLeaveRequests,
  getOneRequest,
  uploadLeaveAttachment,
  listLeaveAttachments,
  submitDraftLeaveRequest,
} from "../controllers/leaveRequestController";

import { staffOnly, managerOnly, hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/apply", authMiddleware, loadDirectoryRole, staffOnly, applyLeave);

router.get(
  "/my-requests",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getMyLeaveRequests,
);
router.get(
  "/:request_id",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getOneRequest,
);
router.post(
  "/:request_id/attachments",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  upload.single("file"),
  uploadLeaveAttachment,
);

router.get(
  "/:request_id/attachments",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  listLeaveAttachments,
);

router.post(
  "/:id/submit",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  submitDraftLeaveRequest,
);

export default router;
