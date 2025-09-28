import express, { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";

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
  email: string;
  hardwareId: string;
}

router.post(
  "/signup",
  async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    try {
      const { email, name, rollNumber, year, section, hardwareId } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      if (!rollNumber) {
        return res.status(400).json({ error: "Roll number is required" });
      }
      if (!hardwareId) {
        return res.status(400).json({ error: "Hardware ID is required" });
      }

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
              rollNumber,
              year,
              section,
              semester: "3",
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
      const { email, hardwareId } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!hardwareId) {
        return res.status(400).json({ error: "Hardware ID is required" });
      }


      const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true },
      });

      if (!user) return res.status(400).json({ error: "User not found" });

      if (user.student?.hardwareId !== hardwareId)
        return res
          .status(400)
          .json({ error: "This device is not authorized for this account" });

      res.status(200).json({ message: "Logged in successfully", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
