import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { hrOrAdmin } from "@libs/rbac";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  setDepartmentHead
} from "../controllers/departmentController";

const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, hrOrAdmin, listDepartments);
router.post("/", authMiddleware, loadDirectoryRole, hrOrAdmin, createDepartment);
router.get("/:dept_key", authMiddleware, loadDirectoryRole, hrOrAdmin, getDepartment);
router.put("/:dept_key", authMiddleware, loadDirectoryRole, hrOrAdmin, updateDepartment);
router.delete("/:dept_key", authMiddleware, loadDirectoryRole, hrOrAdmin, deleteDepartment);
router.post("/:dept_key/head", authMiddleware, loadDirectoryRole, hrOrAdmin, setDepartmentHead);
export default router;
