import { Router } from "express";
import { AuthService } from "../services/authService";
import { validateBody } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const authService = new AuthService();

// Register new user
router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.user,
    } as ApiResponse);
    return;
  })
);

// Login user
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Verify email
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      } as ApiResponse);
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Resend verification email
router.post(
  "/resend-verification",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      } as ApiResponse);
    }

    const result = await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Get current user profile
router.get(
  "/profile",
  authenticate,
  asyncHandler(async (req: any, res) => {
    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: req.user,
    } as ApiResponse);
  })
);

// Change password
router.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Logout
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req: any, res) => {
    const result = await authService.logout(req.user.userId);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Refresh token
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      } as ApiResponse);
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

export default router;
