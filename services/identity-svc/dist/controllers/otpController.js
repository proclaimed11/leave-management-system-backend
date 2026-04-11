"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = void 0;
const otpEngine_1 = require("../services/otpEngine");
const engine = new otpEngine_1.OtpEngine();
const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(422).json({ error: "email is required" });
        }
        await engine.requestOtp(email);
        return res.json({ message: "OTP sent to your email" });
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
};
exports.requestOtp = requestOtp;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res
                .status(422)
                .json({ error: "email and otp are required" });
        }
        const result = await engine.verifyOtp(email, otp);
        return res.json({ message: "Login successful", ...result });
    }
    catch (e) {
        return res.status(401).json({ error: e.message });
    }
};
exports.verifyOtp = verifyOtp;
