import express, { type Request, type Response } from "express";
import { Resend } from "resend";
import config from "../../config";
import {
  otpStore,
  rateLimitStore,
  generateSecureOTP,
  isValidEmail,
  isRateLimited,
  cleanupExpiredOTPs,
  logOTPOperation,
  OTP_EXPIRY_MINUTES,
} from "../../utils/otp";

const router = express.Router();
const resendClient = new Resend(String(config.resendAPI));

interface GenerateOTPRequest {
  email: string;
}

interface ResendOTPRequest {
  email: string;  
}

router.post(
  "/generate",
  async (req: Request<{}, {}, GenerateOTPRequest>, res: Response) => {
    try {
      const { email } = req.body;

      // Input validation
      if (!email) {
        logOTPOperation("GENERATE", "unknown", email, false);
        return res.status(400).json({
          error: "email is required",
          code: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (!isValidEmail(email)) {
        logOTPOperation("GENERATE", email, email, false);
        return res.status(400).json({
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      // Rate limiting
      if (isRateLimited(`generate:${email}`)) {
        logOTPOperation("GENERATE", email, email, false);
        return res.status(429).json({
          error: "Too many OTP requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        });
      }

      // Cleanup expired OTPs
      cleanupExpiredOTPs();

      // Check if user already has an active OTP
      const existingRecord = otpStore.get(email);
      if (existingRecord && existingRecord.expiresAt > Date.now()) {
        const remainingTime = Math.ceil(
          (existingRecord.expiresAt - Date.now()) / 1000
        );
        return res.status(201).json({
          message: "OTP already exists. Reusing active OTP window.",
          alreadyExists: true,
          expiresIn: remainingTime,
        });
      }

      const otp = generateSecureOTP();
      const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      otpStore.set(email, {
        otp,
        expiresAt,
        email,
        attempts: 0,
        createdAt: Date.now(),
      });

      // Send email
      await resendClient.emails.send({
        from: "verification@sahil1337.xyz",
        to: email,
        text: `Your OTP code is: ${otp}`,
        subject: "Your OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p>Your one-time password is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</span>
          </div>
          <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      });

      logOTPOperation("GENERATE", email, email, true);
      res.json({
        message: "OTP generated and sent successfully",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    } catch (error: any) {
      console.error("OTP generation error:", error);
      logOTPOperation(
        "GENERATE",
        req.body.email || "unknown",
        req.body.email,
        false
      );
      res.status(500).json({
        error: "Failed to generate OTP. Please try again.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);

// Resend OTP
router.post(
  "/resend",
  async (req: Request<{}, {}, ResendOTPRequest>, res: Response) => {
    try {
      const { email } = req.body;

      // Input validation
      if (!email) {
        logOTPOperation("RESEND", "unknown", undefined, false);
        return res.status(400).json({
          error: "email is required",
          code: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (!isValidEmail(email)) {
        logOTPOperation("RESEND", email, email, false);
        return res.status(400).json({
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      if (isRateLimited(`resend:${email}`)) {
        logOTPOperation("RESEND", email, email, false);
        return res.status(429).json({
          error: "Too many resend requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        });
      }

      const record = otpStore.get(email);

      if (!record) {
        logOTPOperation("RESEND", email, email, false);
        return res.status(400).json({
          error: "No OTP found for this email. Please generate a new OTP.",
          code: "OTP_NOT_FOUND",
        });
      }
      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        logOTPOperation("RESEND", email, record.email, false);
        return res.status(400).json({
          error: "OTP has expired. Please generate a new OTP.",
          code: "OTP_EXPIRED",
        });
      }

      // Generate new OTP
      const newOtp = generateSecureOTP();
      const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      otpStore.set(email, {
        ...record,
        otp: newOtp,
        expiresAt,
        attempts: 0,
      });

      // Send email
      await resendClient.emails.send({
        from: "onboarding@resend.dev",
        to: record.email,
        subject: "Your OTP Code (Resent)",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code (Resent)</h2>
          <p>Your new one-time password is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${newOtp}</span>
          </div>
          <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      });

      logOTPOperation("RESEND", email, record.email, true);
      res.json({
        message: "OTP resent successfully",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    } catch (error: any) {
      console.error("OTP resend error:", error);
      logOTPOperation("RESEND", req.body.email || "unknown", req.body.email, false);

      res.status(500).json({
        error: "Failed to resend OTP. Please try again.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    activeOTPs: otpStore.size,
    rateLimitEntries: rateLimitStore.size,
  });
});

export default router;
