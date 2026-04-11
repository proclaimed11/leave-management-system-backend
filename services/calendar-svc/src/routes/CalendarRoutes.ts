import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";

import {
  rebuildCalendar,
  getCalendarMonth,
  getDepartmentConflicts,
  getSnapshots
} from "../controllers/calendarController";

const router = Router();

router.post("/rebuild", authMiddleware, rebuildCalendar);

router.get("/:year_month", authMiddleware, getCalendarMonth);

router.get("/conflicts/:department", authMiddleware, getDepartmentConflicts);

router.get("/snapshots/:department", authMiddleware, getSnapshots);

export default router;
