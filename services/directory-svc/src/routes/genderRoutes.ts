import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { listGenders } from "../controllers/genderController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";


const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listGenders);
export default router;
