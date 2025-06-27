import dotenv from "dotenv";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require("ms");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z
    .string()
    .transform((val) => ms(val) / 1000)
    .default("7d"),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .transform((val) => ms(val) / 1000)
    .default("30d"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string().email(),
  FROM_NAME: z.string(),
  FRONTEND_URL: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  EMAIL_VERIFICATION_EXPIRES_IN: z
    .string()
    .transform((val) => ms(val) / 1000)
    .default("24h"),
  PASSWORD_RESET_EXPIRES_IN: z
    .string()
    .transform((val) => ms(val) / 1000)
    .default("1h"),
});

export const env = envSchema.parse(process.env);
export default env;
