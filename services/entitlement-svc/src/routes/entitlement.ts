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
const upload = multer();

router.get("/me", authMiddleware, getMyEntitlements);

// Generate for all employees (HR/Admin)
router.post("/generate", authMiddleware, loadDirectoryRole, hrOrAdmin, generateAllEntitlements);
router.post(
  "/generate-one",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  generateEntitlementsForOne
);

router.post(
  "/opening-balance/preview",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  upload.single("file"),
  previewOpeningBalance
);

router.post(
  "/opening-balance/commit",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  upload.single("file"),
  commitOpeningBalance
);

// Adjustments
router.post("/adjust-balance", authMiddleware, loadDirectoryRole, hrOrAdmin, adjustLeaveBalance);

// Comp-off + yearly reset
router.post("/comp-off", authMiddleware, loadDirectoryRole, hrOrAdmin, recordCompOffEarned);
router.post("/yearly-reset", authMiddleware, loadDirectoryRole, hrOrAdmin, resetYearEntitlements);
router.get(
  "/history/:employee_number",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  getEntitlementHistory
);

router.get("/:employee_number", authMiddleware, loadDirectoryRole, hrOrAdmin, getEmployeeEntitlements);
export default router;
