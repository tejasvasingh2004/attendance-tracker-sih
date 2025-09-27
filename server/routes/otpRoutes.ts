// src/routes/otpRoutes.ts
import express, { type Request, type Response } from "express";
import { Resend } from "resend";
import config from "../config";

const router = express.Router();
const resendClient = new Resend(String(config.resendAPI));

const otpStore: Record<string, { otp: string; expiresAt: number; email: string }> = {};

// Generate OTP and send email
router.post("/generate", async (req: Request, res: Response) => {
  const { userId, email } = req.body;

  if (!userId || !email) return res.status(400).json({ error: "userId and email are required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[userId] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    email
  };

  try {
    await resendClient.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP generated and sent successfully" });
  } catch (error: any) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

// Verify OTP
router.post("/verify", (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) return res.status(400).json({ error: "userId and otp are required" });

  const record = otpStore[userId];

  if (!record) return res.status(400).json({ error: "No OTP generated for this user" });
  if (Date.now() > record.expiresAt) {
    delete otpStore[userId];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  delete otpStore[userId]; // OTP verified
  res.json({ message: "OTP verified successfully" });
});

// Resend OTP
router.post("/resend", async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  const record = otpStore[userId];
  if (!record) return res.status(400).json({ error: "No OTP generated for this user" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[userId] = { ...record, otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    await resendClient.emails.send({
      from: 'onboarding@resend.dev',
      to: record.email,
      subject: 'Your OTP Code (Resent)',
      html: `<p>Your new OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP resent successfully" });
  } catch (error: any) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to resend OTP email" });
  }
});

export default router;
