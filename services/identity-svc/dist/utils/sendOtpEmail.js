"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function getBrevoTransport() {
    const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
    const port = Number(process.env.BREVO_SMTP_PORT || 587);
    const user = process.env.BREVO_SMTP_USER;
    const pass = process.env.BREVO_SMTP_PASS;
    if (!user || !pass) {
        throw new Error("BREVO_SMTP_USER and BREVO_SMTP_PASS must be set");
    }
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
}
async function sendOtpEmail(to, otp) {
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || "ESL Leave System";
    if (!fromEmail) {
        throw new Error("BREVO_FROM_EMAIL must be set");
    }
    const transporter = getBrevoTransport();
    await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: "Your ESL Leave Login OTP",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        html: `
      <p>
       OTP is:</p>
      <h2>${otp}</h2>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    });
    if (process.env.NODE_ENV !== "production") {
        console.log("📧 OTP email sent to:", to);
    }
}
