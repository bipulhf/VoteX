import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateToken,
  generateRefreshToken,
  generateEmailVerificationToken,
} from "../utils/jwt";
import { sendVerificationEmail } from "../utils/email";
import { createError } from "../middleware/errorHandler";
import { User, UserRole } from "@prisma/client";

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createError("User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.USER,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

    return {
      user,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError("Invalid email or password", 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError("Invalid email or password", 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw createError("Please verify your email before logging in", 401);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw createError("Invalid or expired verification token", 400);
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: "Email verified successfully" };
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw createError("Email is already verified", 400);
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken },
    });

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

    return { message: "Verification email sent successfully" };
  }

  async refreshToken(refreshToken: string) {
    try {
      // This would need proper refresh token validation
      // For now, we'll skip the detailed implementation
      throw createError("Refresh token functionality not yet implemented", 501);
    } catch (error) {
      throw createError("Invalid refresh token", 401);
    }
  }

  async logout(userId: string) {
    // In a real implementation, you might want to blacklist the token
    // or store refresh tokens in the database to invalidate them
    return { message: "Logged out successfully" };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw createError("Current password is incorrect", 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password changed successfully" };
  }
}
