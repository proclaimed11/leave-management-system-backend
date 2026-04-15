import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

import {
  getCompOffRules,
  createCompOffRules,
  updateCompOffRules
} from "../controllers/compOffController";

const router = Router();
const auth = authMiddleware as any;
const hrAdmin = hrOrAdmin as any;

router.get("/rules", auth, loadDirectoryRole, hrAdmin, getCompOffRules);
router.post("/rules", auth, loadDirectoryRole, hrAdmin, createCompOffRules);
router.patch("/rules", auth, loadDirectoryRole, hrAdmin, updateCompOffRules);

export default router;
