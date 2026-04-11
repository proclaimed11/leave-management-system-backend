import { Router } from "express";
import {
  createHoliday,
  listHolidays,
  updateHoliday,
  deleteHoliday,
  getHolidaysBetween,
} from "../controllers/holidayController";

import { authMiddleware } from "@libs/auth-jwt";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import {  hrOrAdmin, staffOnly } from "@libs/rbac";

const router = Router();


router.post("/", authMiddleware, loadDirectoryRole,hrOrAdmin, createHoliday);

router.get("/", authMiddleware, loadDirectoryRole,staffOnly, listHolidays);

router.put("/:id", authMiddleware, loadDirectoryRole,hrOrAdmin, updateHoliday);
router.delete("/:id", authMiddleware, loadDirectoryRole,hrOrAdmin, deleteHoliday);


export default router;
