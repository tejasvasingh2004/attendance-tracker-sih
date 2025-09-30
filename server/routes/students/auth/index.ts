import express, { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../../utils/jwt";

const router = express.Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  email: string;
  name: string;
  rollNumber: string;
  year: number;
  section: string;
  hardwareId: string;
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
      const { email, name, rollNumber, year, section, hardwareId } = req.body;

      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!rollNumber)
        return res.status(400).json({ error: "Roll number is required" });
      if (!hardwareId)
        return res.status(400).json({ error: "Hardware ID is required" });

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "User already exists with this email" });
      }

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

      return res.status(201).json({
        message: "Account is Created",
        user,
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
