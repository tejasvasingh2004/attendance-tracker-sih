import jwt from "jsonwebtoken";

const SECRET_KEY = "secret_key";

export function generateToken(payload: object): string {
 
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}
