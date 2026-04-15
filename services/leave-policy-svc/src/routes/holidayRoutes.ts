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
import { hrOrAdmin, staffOnly } from "@libs/rbac";

const router = Router();
const auth = authMiddleware as any;
const hrAdmin = hrOrAdmin as any;
const staff = staffOnly as any;


router.post("/", auth, loadDirectoryRole,hrAdmin, createHoliday);

router.get("/", auth, loadDirectoryRole,staff, listHolidays);

router.put("/:id", auth, loadDirectoryRole,hrAdmin, updateHoliday);
router.delete("/:id", auth, loadDirectoryRole,hrAdmin, deleteHoliday);


export default router;
