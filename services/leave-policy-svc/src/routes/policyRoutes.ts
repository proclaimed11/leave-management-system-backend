

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
const auth = authMiddleware as any;
const hrAdmin = hrOrAdmin as any;

/* -----------------------------------
   LEAVE TYPES
----------------------------------- */
router.get("/leave-types", auth, loadDirectoryRole, hrAdmin,listLeaveTypes);
router.get("/leave-types/:type_key", auth, loadDirectoryRole,hrAdmin,getLeaveType);

router.post("/leave-types", auth, loadDirectoryRole, hrAdmin, createLeaveType);
router.patch("/leave-types/:type_key", auth, loadDirectoryRole, hrAdmin, updateLeaveType);
router.delete("/leave-types/:type_key", auth, loadDirectoryRole, hrAdmin, disableLeaveType);

/* -----------------------------------
   LEAVE RULES
----------------------------------- */
router.get("/leave-rules/:type_key", auth, loadDirectoryRole,hrAdmin,getLeaveRules);
router.post("/leave-rules/:type_key", auth, loadDirectoryRole, hrAdmin, createLeaveRules);
router.patch("/leave-rules/:type_key", auth, loadDirectoryRole, hrAdmin, updateLeaveRules);

/* -----------------------------------
   FULL POLICY (ADMIN / HR)
----------------------------------- */
router.get("/full", auth, loadDirectoryRole, hrAdmin, getFullPolicy);


export default router;
