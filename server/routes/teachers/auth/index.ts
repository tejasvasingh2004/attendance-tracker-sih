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
  employeeId: string;
  department: string;
  otp: string;
}

interface LoginRequestBody {
  employeeId: string;
}

interface CheckRequestBody {
  email?: string;
  employeeId?: string;
}

router.post(
  "/signup",
  async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    try {
      const { email, name, employeeId, department, otp } = req.body;

      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!employeeId)
        return res.status(400).json({ error: "Employee ID is required" });
      if (!department)
        return res.status(400).json({ error: "Department is required" });
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

      const existingTeacher = await prisma.teacher.findUnique({
        where: { employeeId },
      });

      if (existingTeacher) {
        return res.status(400).json({
          error: "Teacher already exists with this employee ID",
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: "TEACHER",
          teacher: {
            create: {
              employeeId,
              department,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          teacher: {
            select: {
              employeeId: true,
              department: true,
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
        message: "Teacher account created and verified successfully",
        user,
        token,
      });
    } catch (error) {
      console.error("Teacher signup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/login",
  async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    try {
      const { employeeId } = req.body;

      if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });

      // Find teacher by employee ID
      const teacher = await prisma.teacher.findUnique({
        where: { employeeId },
        include: { user: true },
      });

      if (!teacher) return res.status(400).json({ error: "Teacher not found" });

      const user = {
        id: teacher.user.id,
        email: teacher.user.email,
        name: teacher.user.name,
        role: teacher.user.role,
        teacher: {
          employeeId: teacher.employeeId,
          department: teacher.department,
        },
      };

      // Generate JWT token with standardized payload structure: userId, email, role
      const token = generateToken({ 
        userId: teacher.user.id, 
        email: teacher.user.email,
        role: teacher.user.role 
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
  async (
    req: Request<{}, {}, CheckRequestBody>,
    res: Response
  ) => {
    try {
      const { email, employeeId } = req.body;
      if (!email && !employeeId) {
        return res
          .status(400)
          .json({ error: "Provide email or employeeId to check" });
      }

      let exists = false;
      
      // Prioritize employeeId check first
      if (employeeId) {
        const teacherByEmployeeId = await prisma.teacher.findUnique({
          where: { employeeId },
        });
        exists = !!teacherByEmployeeId;
      }
      
      // If not found by employeeId, check by email
      if (!exists && email) {
        const userByEmail = await prisma.user.findUnique({ 
          where: { email },
          include: { teacher: true }
        });
        exists = !!(userByEmail && userByEmail.teacher);
      }

      return res.json({ exists });
    } catch (err) {
      console.error("Check teacher error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
