"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const req = (key) => {
    const v = process.env[key];
    if (!v)
        throw new Error(`Missing required env var: ${key}`);
    return v;
};
exports.CONFIG = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3001),
    PASSWORD_SALT_ROUNDS: process.env.PASSWORD_SALT_ROUNDS ?? "10",
    SERVICE_AUTH_TOKEN: req("SERVICE_AUTH_TOKEN"),
    DB: {
        HOST: req("DB_HOST"),
        PORT: Number(process.env.DB_PORT || 5432),
        USER: req("DB_USER"),
        PASSWORD: req("DB_PASSWORD"),
        NAME: req("DB_NAME"),
        SSL: (process.env.DB_SSL || "false").toLowerCase() === "true",
    },
    AUTH: {
        JWT_SECRET: process.env.JWT_SECRET || "esl_default_jwt_secret",
        JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "",
        JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || "",
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
        BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 11),
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "esl_default_jwt_refresh_secret",
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    },
    CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    SERVICES: {
        DIRECTORY_SVC_URL: process.env.DIRECTORY_SVC_URL,
        ENTITLEMENT_SVC_URL: process.env.ENTITLEMENT_SVC_URL,
    },
};
