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
router.get(
  "/candidates",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getHandoverOptions
);
router.get("/my-tasks", authMiddleware, getMyHandoverTasks);
router.get(
  "/received",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getMyReceivedHandovers
);

router.get(
  "/:handover_id",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  getHandoverDetails
);
router.patch(
  "/task/:task_id/complete",
  authMiddleware,
  loadDirectoryRole,
  staffOnly,
  completeHandoverTask
);

router.post("/:request_id/tasks", authMiddleware, addHandoverTask);

router.get("/:request_id/tasks", authMiddleware, getHandoverTasks);

router.patch("/task/:task_id", authMiddleware, updateTaskStatus);

export default router;
