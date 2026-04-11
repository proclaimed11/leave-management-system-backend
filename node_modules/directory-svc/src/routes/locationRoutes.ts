import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { listLocations } from "../controllers/locationController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";


const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listLocations);
export default router;
