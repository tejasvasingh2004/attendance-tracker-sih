import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  databaseUrl: string;
  resendAPI: String;
  jwtSecret: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || "",
  resendAPI: process.env.API_RESEND || " ",
  jwtSecret: process.env.JWT_SECRET || "fallback_secret_key_change_in_production"
};

// Validate JWT secret configuration for security
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET environment variable not set! Using fallback secret which is insecure for production.\n" +
    "   Please set a strong, random JWT_SECRET in your environment variables.\n" +
    "   Generate one with: openssl rand -base64 32"
  );
  
  // In production, consider throwing an error instead of just warning
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "JWT_SECRET must be set in production environment for security. " +
      "Set JWT_SECRET environment variable with a strong, random secret."
    );
  }
}

export default config;
