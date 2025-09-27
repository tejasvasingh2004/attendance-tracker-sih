import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  databaseUrl: string;
  resendAPI: String;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || "",
  resendAPI: process.env.API_RESEND || " "
};

export default config;
