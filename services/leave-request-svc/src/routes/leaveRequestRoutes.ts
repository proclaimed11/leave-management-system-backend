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
const auth = authMiddleware as any;
const staff = staffOnly as any;

router.post("/apply", auth, loadDirectoryRole, staff, applyLeave);

router.get(
  "/my-requests",
  auth,
  loadDirectoryRole,
  staff,
  getMyLeaveRequests,
);
router.get(
  "/:request_id",
  auth,
  loadDirectoryRole,
  staff,
  getOneRequest,
);
router.post(
  "/:request_id/attachments",
  auth,
  loadDirectoryRole,
  staff,
  upload.single("file"),
  uploadLeaveAttachment,
);

router.get(
  "/:request_id/attachments",
  auth,
  loadDirectoryRole,
  staff,
  listLeaveAttachments,
);

router.post(
  "/:id/submit",
  auth,
  loadDirectoryRole,
  staff,
  submitDraftLeaveRequest,
);

export default router;
