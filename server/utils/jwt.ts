import jwt from "jsonwebtoken";

const SECRET_KEY = "kfj23LKJf82jfl2_!@#sdjfl32lksjdf"; // Replace with a secure key or load from env

export function generateToken(payload: object): string {
 
  return jwt.sign(payload, SECRET_KEY, {
  
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
