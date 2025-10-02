import express, { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../../utils/jwt";
import {
  otpStore,
  validateOTPFormat,
  logOTPOperation,
  MAX_OTP_ATTEMPTS,
} from "../../../utils/otp";

const router = express.Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  email: string;
  name: string;
  rollNumber: string;
  year: number;
  section: string;
  hardwareId: string;
  otp?: string;
}

interface LoginRequestBody {
  rollNumber: string;
  hardwareId: string;
}

interface CheckRequestBody {
  email?: string;
  hardwareId?: string;
  rollNumber?: string;
}

router.post(
  "/signup",
  async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    try {
      const { email, name, rollNumber, year, section, hardwareId, otp } = req.body;

      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!rollNumber)
        return res.status(400).json({ error: "Roll number is required" });
      if (!hardwareId)
        return res.status(400).json({ error: "Hardware ID is required" });
      if (!otp) return res.status(400).json({ error: "OTP is required" });

      // Validate OTP format
      if (!validateOTPFormat(otp)) {
        return res.status(400).json({
          error: "OTP must be a 6-digit number",
          code: "INVALID_OTP_FORMAT",
        });
      }

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "User already exists with this email" });
      }

      // Verify OTP before creating account
      const otpRecord = otpStore.get(email); // Using email as userId for OTP lookup

      if (!otpRecord) {
        logOTPOperation("VERIFY_SIGNUP", email, email, false);
        return res.status(404).json({
          error: "No OTP found for this email. Please generate a new OTP.",
          code: "OTP_NOT_FOUND",
        });
      }

      // Check if OTP has expired
      if (Date.now() > otpRecord.expiresAt) {
        otpStore.delete(email);
        logOTPOperation("VERIFY_SIGNUP", email, email, false);
        return res.status(410).json({
          error: "OTP has expired. Please generate a new OTP.",
          code: "OTP_EXPIRED",
        });
      }

      // Check attempt limit
      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(email);
        logOTPOperation("VERIFY_SIGNUP", email, email, false);
        return res.status(429).json({
          error: "Maximum verification attempts exceeded. Please generate a new OTP.",
          code: "MAX_ATTEMPTS_EXCEEDED",
        });
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts++;
        logOTPOperation("VERIFY_SIGNUP", email, email, false);
        return res.status(400).json({
          error: "Invalid OTP",
          code: "INVALID_OTP",
          remainingAttempts: MAX_OTP_ATTEMPTS - otpRecord.attempts,
        });
      }

      // OTP verified successfully, remove from store
      otpStore.delete(email);
      logOTPOperation("VERIFY_SIGNUP", email, email, true);

      const existingUser = await prisma.student.findUnique({
        where: { hardwareId },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "This device is already registered with another account",
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: "STUDENT",
          student: {
            create: {
              hardwareId,
              rollNumber: rollNumber.toLowerCase(),
              year,
              section,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          student: {
            select: {
              hardwareId: true,
              rollNumber: true,
              year: true,
              section: true,
            },
          },
        },
      });

      // Generate JWT token for the newly created user
      const token = generateToken({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      });

      return res.status(201).json({
        message: "Account created successfully.",
        user,
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/login",
  async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    try {
      const { rollNumber, hardwareId } = req.body;

      if (!rollNumber)
        return res.status(400).json({ error: "Roll number is required" });
      if (!hardwareId)
        return res.status(400).json({ error: "Hardware ID is required" });

      console.log("rollNumber", rollNumber.toLowerCase());
      // Find student by roll number
      const student = await prisma.student.findUnique({
        where: { rollNumber: rollNumber.toLowerCase() },
        include: { user: true },
      });

      if (!student) return res.status(400).json({ error: "Student not found" });

      // Check if hardware ID matches
      if (student.hardwareId !== hardwareId)
        return res
          .status(400)
          .json({ error: "This device is not authorized for this account" });

      const user = {
        id: student.user.id,
        email: student.user.email,
        name: student.user.name,
        role: student.user.role,
        student: {
          hardwareId: student.hardwareId,
          rollNumber: student.rollNumber,
          year: student.year,
          section: student.section,
        },
      };

      // Generate JWT token with standardized payload structure: userId, email, role
      const token = generateToken({ 
        userId: student.user.id, 
        email: student.user.email,
        role: student.user.role 
      });

      res.status(200).json({ message: "Logged in successfully", user, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/check",
  async (req: Request<{}, {}, CheckRequestBody>, res: Response) => {
    try {
      const { email, hardwareId, rollNumber } = req.body;
      if (!email && !hardwareId && !rollNumber) {
        return res
          .status(400)
          .json({ error: "Provide email, hardwareId or rollNumber to check" });
      }

      let exists = false;

      // Prioritize rollNumber check first
      if (rollNumber) {
        const studentByRoll = await prisma.student.findUnique({
          where: { rollNumber },
        });
        exists = !!studentByRoll;
      }

      // If not found by rollNumber, check by email
      if (!exists && email) {
        const userByEmail = await prisma.user.findUnique({ where: { email } });
        exists = !!userByEmail;
      }

      // If still not found, check by hardwareId
      if (!exists && hardwareId) {
        const studentByHardware = await prisma.student.findUnique({
          where: { hardwareId },
        });
        exists = !!studentByHardware;
      }

      return res.json({ exists });
    } catch (err) {
      console.error("Check student error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
