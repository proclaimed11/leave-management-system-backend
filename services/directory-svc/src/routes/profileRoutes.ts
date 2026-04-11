import { Router } from "express";
import { authMiddleware } from "@libs/auth-jwt";
import { getMyProfile, updateMyProfile } from "../controllers/profileController";

const router = Router();

router.get("/", authMiddleware, getMyProfile);
router.patch("/", authMiddleware, updateMyProfile);

export default router;
