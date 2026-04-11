"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegisterInput = validateRegisterInput;
function validateRegisterInput(req) {
    const { email, password, employee_number, initial_roles } = req.body;
    if (!email || typeof email !== "string") {
        throw new Error("email is required");
    }
    if (!password || typeof password !== "string") {
        throw new Error("password is required");
    }
    return {
        employee_number: employee_number ?? null,
        email,
        password,
        initial_roles
    };
}
