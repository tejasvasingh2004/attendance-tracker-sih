import { randomBytes } from "crypto";

// Shared OTP store - in production, this should use Redis or another persistent store
export const otpStore = new Map<
  string,
  {
    otp: string;
    expiresAt: number;
    email: string;
    attempts: number;
    createdAt: number;
  }
>();

// OTP Constants
export const OTP_EXPIRY_MINUTES = 5;
export const MAX_OTP_ATTEMPTS = 10;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_OTP_REQUESTS_PER_WINDOW = 10;
export const OTP_LENGTH = 6;

export const generateSecureOTP = (): string => {
  const randomBytesArray = randomBytes(4); // 4 bytes = 32 bits
  const randomNumber = randomBytesArray.readUInt32BE(0);

  // Generate 6-digit OTP
  const otp = (randomNumber % 1000000).toString().padStart(OTP_LENGTH, "0");

  return otp;
};

export const validateOTPFormat = (otp: string): boolean => {
  // Check if OTP is exactly 6 digits and contains only numbers
  return /^\d{6}$/.test(otp) && otp.length === OTP_LENGTH;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUserId = (userId: string): boolean => {
  return Boolean(userId && userId.trim().length > 0);
};

export const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const isRateLimited = (identifier: string): boolean => {
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

export const cleanupExpiredOTPs = (): void => {
  const now = Date.now();
  for (const [userId, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(userId);
    }
  }
};

export const logOTPOperation = (
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
