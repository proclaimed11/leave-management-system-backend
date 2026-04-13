import { Router } from "express";
import {
  login,
  loginWithSso,
  getMe,
  registerUser,
  logoutAll,
  logout,
  refreshToken,
  changePassword,
} from "../controllers/identityController";
import {
  provisionUser,
  deleteUserForDirectoryEmployee,
} from "../controllers/internalController";

import { authMiddleware } from "@libs/auth-jwt";
import { requestOtp, verifyOtp } from "../controllers/otpController";

const router = Router();

router.post("/login", login);

router.post("/sso/login", loginWithSso);

router.get("/me", authMiddleware,getMe);

router.post("/change-password", authMiddleware, changePassword);

router.post("/internal/provision-user", provisionUser);
router.post("/internal/delete-user-for-employee", deleteUserForDirectoryEmployee);

router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", authMiddleware, logoutAll);

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

// DEV ONLY — DO NOT expose in production
router.post("/register", registerUser);


export default router;
