import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { listCompanies, getCompanyOverview} from "../controllers/companyController";
import { getDashboardOverview } from "../controllers/dashboardController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";



const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listCompanies);
router.get("/overview", authMiddleware, loadDirectoryRole, hrOrAdmin, getCompanyOverview);


export default router;
