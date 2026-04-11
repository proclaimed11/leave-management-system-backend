

import { Router } from "express";
import {
  listLeaveTypes,
  getLeaveType,
  createLeaveType,
  updateLeaveType,
  disableLeaveType,
  getLeaveRules,
  createLeaveRules,
  updateLeaveRules,
  getFullPolicy
} from "../controllers/leavePolicyController";

import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

const router = Router();

/* -----------------------------------
   LEAVE TYPES
----------------------------------- */
router.get("/leave-types", authMiddleware, loadDirectoryRole, hrOrAdmin,listLeaveTypes);
router.get("/leave-types/:type_key", authMiddleware, loadDirectoryRole,hrOrAdmin,getLeaveType);

router.post("/leave-types", authMiddleware, loadDirectoryRole, hrOrAdmin, createLeaveType);
router.patch("/leave-types/:type_key", authMiddleware, loadDirectoryRole, hrOrAdmin, updateLeaveType);
router.delete("/leave-types/:type_key", authMiddleware, loadDirectoryRole, hrOrAdmin, disableLeaveType);

/* -----------------------------------
   LEAVE RULES
----------------------------------- */
router.get("/leave-rules/:type_key", authMiddleware, loadDirectoryRole,hrOrAdmin,getLeaveRules);
router.post("/leave-rules/:type_key", authMiddleware, loadDirectoryRole, hrOrAdmin, createLeaveRules);
router.patch("/leave-rules/:type_key", authMiddleware, loadDirectoryRole, hrOrAdmin, updateLeaveRules);

/* -----------------------------------
   FULL POLICY (ADMIN / HR)
----------------------------------- */
router.get("/full", authMiddleware, loadDirectoryRole, hrOrAdmin, getFullPolicy);


export default router;
