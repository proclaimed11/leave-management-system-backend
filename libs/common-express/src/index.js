"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.HttpError = exports.makeApp = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
/**
 * Creates a standard Express app with JSON, logging, and CORS.
 */
const makeApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("dev"));
    return app;
};
exports.makeApp = makeApp;
/**
 * Simple custom error class with status code
 */
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
/**
 * Global error handler to catch all errors
 */
const errorHandler = (err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
};
exports.errorHandler = errorHandler;
