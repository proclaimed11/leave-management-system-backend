import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import multer from "multer";
import {
  getMyEntitlements,
  getEmployeeEntitlements,
  adjustLeaveBalance,
  recordCompOffEarned,
  resetYearEntitlements,
  generateEntitlementsForOne,
  generateAllEntitlements,
  getEntitlementHistory,
} from "../controllers/entitlementController";
import {
  commitOpeningBalance,
  previewOpeningBalance,
} from "../controllers/openingBalanceController";

const router = Router();
const auth = authMiddleware as any;
const hrAdmin = hrOrAdmin as any;
const upload = multer();

router.get("/me", auth, getMyEntitlements);

// Generate for all employees (HR/Admin)
router.post("/generate", auth, loadDirectoryRole, hrAdmin, generateAllEntitlements);
router.post(
  "/generate-one",
  auth,
  loadDirectoryRole,
  hrAdmin,
  generateEntitlementsForOne
);

router.post(
  "/opening-balance/preview",
  auth,
  loadDirectoryRole,
  hrAdmin,
  upload.single("file"),
  previewOpeningBalance
);

router.post(
  "/opening-balance/commit",
  auth,
  loadDirectoryRole,
  hrAdmin,
  upload.single("file"),
  commitOpeningBalance
);

// Adjustments
router.post("/adjust-balance", auth, loadDirectoryRole, hrAdmin, adjustLeaveBalance);

// Comp-off + yearly reset
router.post("/comp-off", auth, loadDirectoryRole, hrAdmin, recordCompOffEarned);
router.post("/yearly-reset", auth, loadDirectoryRole, hrAdmin, resetYearEntitlements);
router.get(
  "/history/:employee_number",
  auth,
  loadDirectoryRole,
  hrAdmin,
  getEntitlementHistory
);

router.get("/:employee_number", auth, loadDirectoryRole, hrAdmin, getEmployeeEntitlements);
export default router;
