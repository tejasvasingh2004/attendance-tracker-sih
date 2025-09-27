import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

// In-memory "database" for testing
const users: {
  enrollmentNumber: string;
  email: string;
  password: string;
  hardwareId: string;
  emailToken: string | null;
  isVerified: boolean;
}[] = [];

export const register = async (req: Request, res: Response): Promise<void> => {
  const { enrollmentNumber, email, password, hardwareId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = uuidv4();

    users.push({
      enrollmentNumber,
      email,
      password: hashedPassword,
      hardwareId,
      emailToken,
      isVerified: false,
    });

    // Respond directly since mailer and DB are gone
    res.json({
      message: "Registration successful. Use your hardware ID and token to login.",
      emailToken, // send token for testing
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const hwid = req.headers["hardware-id"] as string;

  try {
    const user = users.find((u) => u.emailToken === token);

    if (!user) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    if (user.hardwareId !== hwid) {
      res.status(403).json({ message: "Device not recognized" });
      return;
    }

    user.isVerified = true;
    user.emailToken = null;

    const jwtToken = jwt.sign(
      { enrollmentNumber: user.enrollmentNumber },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
