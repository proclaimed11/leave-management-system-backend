import { Router } from "express";
import { createLeaveDraftInternal } from "../controllers/leaveDraftController";
import { internalOnly } from "@libs/rbac";

const router = Router();
const internal = internalOnly as any;

router.post("/leave-requests/draft", internal, createLeaveDraftInternal);

export default router;
