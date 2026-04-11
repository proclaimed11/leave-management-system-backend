import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import {
  getCalendar,
  getCalendarCount,
} from "../controllers/calendarController";

const router = Router();

router.get("/", authMiddleware, loadDirectoryRole, getCalendar);
router.get(
  "/count",
  authMiddleware,
  loadDirectoryRole,
  getCalendarCount,
);
export default router;
