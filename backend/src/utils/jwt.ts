import jwt from "jsonwebtoken";
import env from "../config/env";
import { JwtPayload } from "../types";

export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (
  payload: Omit<JwtPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const generateEmailVerificationToken = (): string => {
  return jwt.sign({}, env.JWT_SECRET, {
    expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN,
  });
};

export const generatePasswordResetToken = (): string => {
  return jwt.sign({}, env.JWT_SECRET, {
    expiresIn: env.PASSWORD_RESET_EXPIRES_IN,
  });
};
