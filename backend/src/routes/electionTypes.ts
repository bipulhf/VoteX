import { Router } from "express";
import { ElectionTypeService } from "../services/electionTypeService";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import {
  createElectionTypeSchema,
  updateElectionTypeSchema,
  idParamSchema,
  paginationSchema,
} from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const electionTypeService = new ElectionTypeService();

// Get all election types
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await electionTypeService.getAllElectionTypes();

    res.json({
      success: true,
      message: "Election types retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get election type by ID
router.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await electionTypeService.getElectionTypeById(req.params.id);

    res.json({
      success: true,
      message: "Election type retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Create new election type (admin only)
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateBody(createElectionTypeSchema),
  asyncHandler(async (req, res) => {
    const result = await electionTypeService.createElectionType(req.body);

    res.status(201).json({
      success: true,
      message: "Election type created successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Update election type (admin only)
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateElectionTypeSchema),
  asyncHandler(async (req, res) => {
    const result = await electionTypeService.updateElectionType(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Election type updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Delete election type (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await electionTypeService.deleteElectionType(req.params.id);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

export default router;
