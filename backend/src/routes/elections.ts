import { Router } from "express";
import { ElectionService } from "../services/electionService";
import { authenticate, requireAdmin, optionalAuth } from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import {
  createElectionSchema,
  updateElectionSchema,
  createCandidateSchema,
  updateCandidateSchema,
  castVoteSchema,
  addCommissionerSchema,
  idParamSchema,
  paginationSchema,
} from "../utils/validators";
import { ApiResponse } from "../types";

const router = Router();
const electionService = new ElectionService();

// Get elections (filtered by user eligibility)
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: any, res) => {
    const result = await electionService.getElectionsForUser(
      req.user?.userId,
      req.user?.role
    );

    res.json({
      success: true,
      message: "Elections retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get all elections (admin only)
router.get(
  "/all",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: any, res) => {
    const result = await electionService.getAllElections();

    res.json({
      success: true,
      message: "All elections retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get commissioner elections for authenticated user
router.get(
  "/my-commissioner-assignments",
  authenticate,
  asyncHandler(async (req: any, res) => {
    const result = await electionService.getCommissionerElections(
      req.user.userId
    );

    res.json({
      success: true,
      message: "Commissioner elections retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Get election by ID
router.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (req: any, res) => {
    const userId = req.user?.userId; // Optional auth
    const result = await electionService.getElectionById(req.params.id, userId);

    res.json({
      success: true,
      message: "Election retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Create new election (admin only)
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateBody(createElectionSchema),
  asyncHandler(async (req: any, res) => {
    const electionData = {
      ...req.body,
      createdById: req.user.userId,
    };

    const result = await electionService.createElection(electionData);

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Update election (admin only)
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateElectionSchema),
  asyncHandler(async (req, res) => {
    const result = await electionService.updateElection(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Election updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Delete election (admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await electionService.deleteElection(req.params.id);

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Add candidate to election (admin only)
router.post(
  "/:id/candidates",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(createCandidateSchema),
  asyncHandler(async (req, res) => {
    const result = await electionService.addCandidate(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Update candidate (admin only)
router.put(
  "/:electionId/candidates/:candidateId",
  authenticate,
  requireAdmin,
  validateBody(updateCandidateSchema),
  asyncHandler(async (req, res) => {
    const result = await electionService.updateCandidate(
      req.params.candidateId,
      req.body
    );

    res.json({
      success: true,
      message: "Candidate updated successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Delete candidate (admin only)
router.delete(
  "/:electionId/candidates/:candidateId",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await electionService.deleteCandidate(
      req.params.candidateId
    );

    res.json({
      success: true,
      message: result.message,
    } as ApiResponse);
    return;
  })
);

// Cast vote (authenticated users only)
router.post(
  "/:id/vote",
  authenticate,
  validateParams(idParamSchema),
  validateBody(castVoteSchema),
  asyncHandler(async (req: any, res) => {
    const { candidateId } = req.body;
    const result = await electionService.castVote(
      req.user.userId,
      req.params.id,
      candidateId
    );

    // Emit real-time update to election room
    const io = req.app.get("io");
    io.to(`election-${req.params.id}`).emit("vote-cast", {
      electionId: req.params.id,
      voteId: result.voteId,
    });

    res.json({
      success: true,
      message: result.message,
      data: { voteId: result.voteId },
    } as ApiResponse);
    return;
  })
);

// Get election results
router.get(
  "/:id/results",
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const result = await electionService.getElectionResults(req.params.id);

    res.json({
      success: true,
      message: "Election results retrieved successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Add commissioner to election (admin only)
router.post(
  "/:id/commissioners",
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(addCommissionerSchema),
  asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const result = await electionService.addCommissioner(req.params.id, userId);

    res.status(201).json({
      success: true,
      message: "Commissioner added successfully",
      data: result,
    } as ApiResponse);
    return;
  })
);

// Approve election results (commissioner only)
router.post(
  "/:id/approve-results",
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(async (req: any, res) => {
    const result = await electionService.approveResults(
      req.params.id,
      req.user.userId
    );

    // Emit real-time update if results are published
    if (result.published) {
      const io = req.app.get("io");
      io.to(`election-${req.params.id}`).emit("results-published", {
        electionId: req.params.id,
        message: "Election results have been published",
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: { published: result.published },
    } as ApiResponse);
    return;
  })
);

export default router;
