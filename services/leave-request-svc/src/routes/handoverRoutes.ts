import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { staffOnly } from "@libs/rbac";
import {
  completeHandoverTask,
  getHandoverDetails,
  getHandoverOptions,
  getMyReceivedHandovers,
} from "../controllers/handoverController";
import { loadDirectoryRole } from "../middleware/loadDirectoryRole";
import {
  addHandoverTask,
  getHandoverTasks,
  updateTaskStatus,
  getMyHandoverTasks,
} from "../controllers/handoverController";

const router = Router();
const auth = authMiddleware as any;
const staff = staffOnly as any;
router.get(
  "/candidates",
  auth,
  loadDirectoryRole,
  staff,
  getHandoverOptions
);
router.get("/my-tasks", auth, getMyHandoverTasks);
router.get(
  "/received",
  auth,
  loadDirectoryRole,
  staff,
  getMyReceivedHandovers
);

router.get(
  "/:handover_id",
  auth,
  loadDirectoryRole,
  staff,
  getHandoverDetails
);
router.patch(
  "/task/:task_id/complete",
  auth,
  loadDirectoryRole,
  staff,
  completeHandoverTask
);

router.post("/:request_id/tasks", auth, addHandoverTask);

router.get("/:request_id/tasks", auth, getHandoverTasks);

router.patch("/task/:task_id", auth, updateTaskStatus);

export default router;
