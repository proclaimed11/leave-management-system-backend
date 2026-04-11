import { Request, Response } from "express";
import { OtpEngine } from "../services/otpEngine";

const engine = new OtpEngine();

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ error: "email is required" });
    }

    await engine.requestOtp(email);

    return res.json({ message: "OTP sent to your email" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(422)
        .json({ error: "email and otp are required" });
    }

    const result = await engine.verifyOtp(email, otp);
    return res.json({ message: "Login successful", ...result });
  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
};
