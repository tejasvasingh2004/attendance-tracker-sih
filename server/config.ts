import dotenv, { config } from "dotenv";

dotenv.config();

interface Config {
  port: number;
}

export default {
  port: parseInt(process.env.PORT || "3000"),
} as Config;
