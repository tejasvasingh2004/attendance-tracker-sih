import express, { type Request, type Response } from "express";
import { PrismaClient, type User } from "@prisma/client";

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
router.post("/signup", async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
  try {
    const { email, name, rollNumber, year, section, hardwareId } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const existingHardware = await prisma.user.findUnique({ where: { hardwareId } });
    if (existingHardware) {
      return res.status(400).json({ error: "This device is already registered with another account" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: "STUDENT",
        hardwareId,
        student: {
          create: {
            rollNumber,
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
        hardwareId: true,
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
      message: "Account is Created",
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
interface LoginRequestBody {
  email: string;
  hardwareId: string;
}
router.post("/login", async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    console.log("USER", req.body)

    const { email, hardwareId } = req.body;
    
    console.log("Login request:", email, hardwareId);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.hardwareId !== hardwareId)
      return res.status(400).json({ error: "This device is not authorized for this account" });

    res.status(200).json({ message: "Logged in successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});




export default router;
