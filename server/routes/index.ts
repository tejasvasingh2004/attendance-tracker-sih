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
}
router.post("/signup", async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
  try {
    const { email, name, rollNumber } = req.body;

    // Check if a user already exists with the same email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        role: "STUDENT",
        name,
        student: {
          create: {
            rollNumber,
            year :2025,
            section : "A",
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
            rollNumber: true,
            year: true,
            section: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Student created successfully",
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
