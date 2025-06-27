import { Router } from "express";
import { UserService } from "../services/userService";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateParams, validateQuery } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { idParamSchema, paginationSchema } from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const userService = new UserService();

// Get all users (admin only)
router.get(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers();

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get user by ID (admin only)
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Update user role (admin only)
router.put(
  "/:id/role",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (USER or ADMIN)",
      } as ApiResponse);
    }

    const result = await userService.updateUserRole(req.params.id, role);

    res.json({
      success: true,
      message: "User role updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Deactivate user (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await userService.deactivateUser(req.params.id);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

export default router;
