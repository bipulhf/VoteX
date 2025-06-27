import { Router } from "express";
import { EligibleVoterService } from "../services/eligibleVoterService";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { bulkEligibleVotersSchema, idParamSchema } from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const eligibleVoterService = new EligibleVoterService();

// Get eligible voters for an election (public)
router.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await eligibleVoterService.getEligibleVoters(req.params.id);

    res.json({
      success: true,
      message: "Eligible voters retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Bulk add eligible voters to an election (admin only)
router.post(
  "/:id/add",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(bulkEligibleVotersSchema),
  asyncHandler(async (req, res) => {
    const { emails } = req.body;
    const result = await eligibleVoterService.bulkAddEligibleVoters(
      req.params.id,
      emails
    );

    res.status(201).json({
      success: true,
      message: "Eligible voters added successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Bulk update (replace all) eligible voters for an election (admin only)
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(bulkEligibleVotersSchema),
  asyncHandler(async (req, res) => {
    const { emails } = req.body;
    const result = await eligibleVoterService.bulkUpdateEligibleVoters(
      req.params.id,
      emails
    );

    res.json({
      success: true,
      message: "Eligible voters updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

export default router;
