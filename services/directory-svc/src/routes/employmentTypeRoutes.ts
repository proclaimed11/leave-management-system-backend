import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { listEmploymentTypes } from "../controllers/employmentTypeController";

const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listEmploymentTypes);

export default router;
