import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { listCountries } from "../controllers/countryController";

const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listCountries);

export default router;
