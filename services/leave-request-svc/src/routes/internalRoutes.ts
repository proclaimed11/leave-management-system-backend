import { Router } from "express";
import { createLeaveDraftInternal } from "../controllers/leaveDraftController";
import { internalOnly } from "@libs/rbac";

const router = Router();

router.post("/leave-requests/draft", internalOnly, createLeaveDraftInternal);

export default router;
