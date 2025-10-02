import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

interface MyJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}


export interface AuthRequest extends Request {
  user?: MyJwtPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as MyJwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
