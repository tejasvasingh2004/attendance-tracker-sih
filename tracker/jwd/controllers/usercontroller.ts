import { Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware"; // adjust path if needed

export const dashboard = (req: AuthRequest, res: Response): void => {
  if (!req.user || typeof req.user === "string") {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({
    message: `Welcome ${req.user.enrollmentNumber} to your dashboard!`,
  });
};
