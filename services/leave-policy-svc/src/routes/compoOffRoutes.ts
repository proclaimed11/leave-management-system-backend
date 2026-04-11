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

router.get("/rules", authMiddleware, loadDirectoryRole, hrOrAdmin, getCompOffRules);
router.post("/rules", authMiddleware, loadDirectoryRole, hrOrAdmin, createCompOffRules);
router.patch("/rules", authMiddleware, loadDirectoryRole, hrOrAdmin, updateCompOffRules);

export default router;
