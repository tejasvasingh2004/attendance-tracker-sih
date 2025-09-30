import express, { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../../utils/jwt";

const router = express.Router();
const prisma = new PrismaClient();

interface SignupRequestBody {
  email: string;
  name: string;
  employeeId: string;
  department: string;
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
      const { email, name, employeeId, department } = req.body;

      if (!email) return res.status(400).json({ error: "Email is required" });
      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!employeeId)
        return res.status(400).json({ error: "Employee ID is required" });
      if (!department)
        return res.status(400).json({ error: "Department is required" });

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "User already exists with this email" });
      }

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

      return res.status(201).json({
        message: "Teacher account created successfully",
        user,
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
