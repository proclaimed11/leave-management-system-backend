import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import {
  getCalendar,
  getCalendarCount,
} from "../controllers/calendarController";

const router = Router();
const auth = authMiddleware as any;

router.get("/", auth, loadDirectoryRole, getCalendar);
router.get(
  "/count",
  auth,
  loadDirectoryRole,
  getCalendarCount,
);
export default router;
