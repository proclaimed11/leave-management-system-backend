import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";

import { previewEmployeeImport, commitEmployeeImport } from "../controllers/employeeImportController";


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/importEmployees/preview",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  upload.single("file") as any,
  previewEmployeeImport
);
router.post(
  "/importEmployees/commit",
  authMiddleware,
  loadDirectoryRole,
  hrOrAdmin,
  upload.single("file") as any,
  commitEmployeeImport
);

export default router;
