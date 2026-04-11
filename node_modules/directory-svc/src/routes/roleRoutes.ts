import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import { assignEmployeeRole, listEmployeesByRole, listHodCandidates, listRoles, listSupervisorCandidates } from "../controllers/roleController";

const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listRoles);
router.put(
  "/:employee_number/assign-role",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  assignEmployeeRole
);


router.get(
  "/by-role",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  listEmployeesByRole
);
router.get(
  "/hod-candidates",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  listHodCandidates
);

router.get(
  "/supervisor-candidates",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  listSupervisorCandidates
);
  
export default router;
