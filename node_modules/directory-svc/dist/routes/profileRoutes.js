"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_jwt_1 = require("@libs/auth-jwt");
const profileController_1 = require("../controllers/profileController");
const router = (0, express_1.Router)();
router.get("/", auth_jwt_1.authMiddleware, profileController_1.getMyProfile);
router.patch("/", auth_jwt_1.authMiddleware, profileController_1.updateMyProfile);
exports.default = router;
