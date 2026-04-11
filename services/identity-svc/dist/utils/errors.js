"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClientError = exports.AppError = void 0;
class AppError extends Error {
    status;
    details;
    constructor(message, status = 400, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
exports.AppError = AppError;
const isClientError = (e) => e instanceof AppError && e.status >= 400 && e.status < 500;
exports.isClientError = isClientError;
