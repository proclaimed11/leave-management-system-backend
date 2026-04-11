import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { listMaritalStatuses } from "../controllers/maritalStatusController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";


const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listMaritalStatuses);
export default router;
