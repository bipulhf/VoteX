import { Router } from "express";
import { ReportService } from "../services/reportService";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import {
  createReportSchema,
  updateReportSchema,
  idParamSchema,
  electionIdParamSchema,
} from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const reportService = new ReportService();

// Get all reports (admin and commissioners only)
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: any, res) => {
    const result = await reportService.getReports(
      req.user.role,
      req.user.userId,
      req.query.search
    );

    res.json({
      success: true,
      message: "Reports retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get reports by election ID (admin and commissioners only)
router.get(
  "/election/:electionId",
  authenticate,
  validateParams(electionIdParamSchema),
  asyncHandler(async (req: any, res) => {
    const result = await reportService.getReportsByElection(
      req.params.electionId,
      req.user.role,
      req.user.userId
    );

    res.json({
      success: true,
      message: "Election reports retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get report by ID
router.get(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(async (req: any, res) => {
    const result = await reportService.getReportById(
      req.params.id,
      req.user.role,
      req.user.userId
    );

    res.json({
      success: true,
      message: "Report retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Create new report (eligible voters only)
router.post(
  "/",
  authenticate,
  validateBody(createReportSchema),
  asyncHandler(async (req: any, res) => {
    const result = await reportService.createReport(req.body, req.user.userId);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Update report (reporter only)
router.put(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  validateBody(updateReportSchema),
  asyncHandler(async (req: any, res) => {
    const result = await reportService.updateReport(
      req.params.id,
      req.body,
      req.user.userId
    );

    res.json({
      success: true,
      message: "Report updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Delete report (reporter and admin only)
router.delete(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(async (req: any, res) => {
    const result = await reportService.deleteReport(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

export default router;
