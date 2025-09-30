import express, { type Request, type Response } from "express";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import config from "../../config";
import { generateToken } from "../../utils/jwt";

const router = express.Router();
const resendClient = new Resend(String(config.resendAPI));

const otpStore = new Map<
  string,
  {
    otp: string;
    expiresAt: number;
    email: string;
    attempts: number;
    createdAt: number;
  }
>();

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface GenerateOTPRequest {
  userId: string;
  email: string;
}

interface VerifyOTPRequest {
  userId: string;
  otp: string;
}

interface ResendOTPRequest {
  userId: string;
}

// Constants
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_OTP_REQUESTS_PER_WINDOW = 10;
const OTP_LENGTH = 6;

const generateSecureOTP = (): string => {
  const randomBytesArray = randomBytes(4); // 4 bytes = 32 bits
  const randomNumber = randomBytesArray.readUInt32BE(0);

  // Generate 6-digit OTP
  const otp = (randomNumber % 1000000).toString().padStart(OTP_LENGTH, "0");

  return otp;
};

const validateOTPFormat = (otp: string): boolean => {
  // Check if OTP is exactly 6 digits and contains only numbers
  return /^\d{6}$/.test(otp) && otp.length === OTP_LENGTH;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUserId = (userId: string): boolean => {
  return Boolean(userId && userId.trim().length > 0);
};

const isRateLimited = (identifier: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= MAX_OTP_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
};

const cleanupExpiredOTPs = (): void => {
  const now = Date.now();
  for (const [userId, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(userId);
    }
  }
};

const logOTPOperation = (
  operation: string,
  userId: string,
  email?: string,
  success: boolean = true
) => {
  const timestamp = new Date().toISOString();
  const status = success ? "SUCCESS" : "FAILED";
  console.log(
    `[${timestamp}] OTP_${operation}_${status} - UserId: ${userId}${email ? `, Email: ${email}` : ""
    }`
  );
};

router.post(
  "/generate",
  async (req: Request<{}, {}, GenerateOTPRequest>, res: Response) => {
    try {
      const { userId, email } = req.body;

      // Input validation
      if (!userId || !email) {
        logOTPOperation("GENERATE", userId || "unknown", email, false);
        return res.status(400).json({
          error: "userId and email are required",
          code: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (!isValidUserId(userId)) {
        logOTPOperation("GENERATE", userId, email, false);
        return res.status(400).json({
          error: "Invalid userId format",
          code: "INVALID_USER_ID",
        });
      }

      if (!isValidEmail(email)) {
        logOTPOperation("GENERATE", userId, email, false);
        return res.status(400).json({
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      // Rate limiting
      if (isRateLimited(`generate:${userId}`)) {
        logOTPOperation("GENERATE", userId, email, false);
        return res.status(429).json({
          error: "Too many OTP requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        });
      }

      // Cleanup expired OTPs
      cleanupExpiredOTPs();

      // Check if user already has an active OTP
      const existingRecord = otpStore.get(userId);
      if (existingRecord && existingRecord.expiresAt > Date.now()) {
        const remainingTime = Math.ceil(
          (existingRecord.expiresAt - Date.now()) / 1000
        );
        logOTPOperation("GENERATE", userId, email, false);
        return res.status(409).json({
          error: `OTP already exists. Please wait ${remainingTime} seconds before requesting a new one.`,
          code: "OTP_ALREADY_EXISTS",
        });
      }

      const otp = generateSecureOTP();
      const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      otpStore.set(userId, {
        otp,
        expiresAt,
        email,
        attempts: 0,
        createdAt: Date.now(),
      });

      // Send email
      await resendClient.emails.send({
        from: "onboarding@resend.dev",
        to: email,
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

      logOTPOperation("GENERATE", userId, email, true);
      res.json({
        message: "OTP generated and sent successfully",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    } catch (error: any) {
      console.error("OTP generation error:", error);
      logOTPOperation(
        "GENERATE",
        req.body.userId || "unknown",
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

// Verify OTP
router.post(
  "/verify",
  (req: Request<{}, {}, VerifyOTPRequest>, res: Response) => {
    try {
      const { userId, otp } = req.body;

      // Input validation
      if (!userId || !otp) {
        logOTPOperation("VERIFY", userId || "unknown", undefined, false);
        return res.status(400).json({
          error: "userId and otp are required",
          code: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (!isValidUserId(userId)) {
        logOTPOperation("VERIFY", userId, undefined, false);
        return res.status(400).json({
          error: "Invalid userId format",
          code: "INVALID_USER_ID",
        });
      }

      if (!validateOTPFormat(otp)) {
        logOTPOperation("VERIFY", userId, undefined, false);
        return res.status(400).json({
          error: "OTP must be a 6-digit number",
          code: "INVALID_OTP_FORMAT",
        });
      }

      const record = otpStore.get(userId);

      if (!record) {
        logOTPOperation("VERIFY", userId, undefined, false);
        return res.status(400).json({
          error: "No OTP found for this user. Please generate a new OTP.",
          code: "OTP_NOT_FOUND",
        });
      }

      // Check if OTP has expired
      if (Date.now() > record.expiresAt) {
        otpStore.delete(userId);
        logOTPOperation("VERIFY", userId, record.email, false);
        return res.status(400).json({
          error: "OTP has expired. Please generate a new OTP.",
          code: "OTP_EXPIRED",
        });
      }

      // Check attempt limit
      if (record.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(userId);
        logOTPOperation("VERIFY", userId, record.email, false);
        return res.status(400).json({
          error:
            "Maximum verification attempts exceeded. Please generate a new OTP.",
          code: "MAX_ATTEMPTS_EXCEEDED",
        });
      }

      // Verify OTP
      if (record.otp !== otp) {
        record.attempts++;
        logOTPOperation("VERIFY", userId, record.email, false);
        return res.status(400).json({
          error: "Invalid OTP",
          code: "INVALID_OTP",
          remainingAttempts: MAX_OTP_ATTEMPTS - record.attempts,
        });
      }


      otpStore.delete(userId);
      logOTPOperation("VERIFY", userId, record.email, true);

      // Generate JWT token with unlimited expiry
      const token = generateToken({ userId, email: record.email });

      res.json({
        message: "OTP verified successfully",
        verifiedAt: new Date().toISOString(),
        token,
      });

    } catch (error: any) {
      console.error("OTP verification error:", error);
      logOTPOperation("VERIFY", req.body.userId || "unknown", undefined, false);

      res.status(500).json({
        error: "Failed to verify OTP. Please try again.",
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
      const { userId } = req.body;

      // Input validation
      if (!userId) {
        logOTPOperation("RESEND", "unknown", undefined, false);
        return res.status(400).json({
          error: "userId is required",
          code: "MISSING_REQUIRED_FIELDS",
        });
      }

      if (!isValidUserId(userId)) {
        logOTPOperation("RESEND", userId, undefined, false);
        return res.status(400).json({
          error: "Invalid userId format",
          code: "INVALID_USER_ID",
        });
      }

      if (isRateLimited(`resend:${userId}`)) {
        logOTPOperation("RESEND", userId, undefined, false);
        return res.status(429).json({
          error: "Too many resend requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
        });
      }

      const record = otpStore.get(userId);

      if (!record) {
        logOTPOperation("RESEND", userId, undefined, false);
        return res.status(400).json({
          error: "No OTP found for this user. Please generate a new OTP.",
          code: "OTP_NOT_FOUND",
        });
      }
      if (Date.now() > record.expiresAt) {
        otpStore.delete(userId);
        logOTPOperation("RESEND", userId, record.email, false);
        return res.status(400).json({
          error: "OTP has expired. Please generate a new OTP.",
          code: "OTP_EXPIRED",
        });
      }

      // Generate new OTP
      const newOtp = generateSecureOTP();
      const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      otpStore.set(userId, {
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

      logOTPOperation("RESEND", userId, record.email, true);
      res.json({
        message: "OTP resent successfully",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    } catch (error: any) {
      console.error("OTP resend error:", error);
      logOTPOperation("RESEND", req.body.userId || "unknown", undefined, false);

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
