import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";
import { ElectionStatus, UserRole } from "@prisma/client";
import {
  PaginationQuery,
  PaginatedResponse,
  VotingStats,
  ElectionResult,
} from "../types";
import { sendElectionNotification } from "../utils/email";

export class ElectionService {
  async createElection(data: {
    title: string;
    description?: string;
    electionTypeId: string;
    startDate: string;
    endDate: string;
    createdById: string;
  }) {
    // Verify election type exists
    const electionType = await prisma.electionType.findUnique({
      where: { id: data.electionTypeId },
    });

    if (!electionType || !electionType.isActive) {
      throw createError("Invalid election type", 400);
    }

    // Create election
    const election = await prisma.election.create({
      data: {
        title: data.title,
        description: data.description,
        electionTypeId: data.electionTypeId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById: data.createdById,
        status: ElectionStatus.ACTIVE,
      },
      include: {
        electionType: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return election;
  }

  async getElections(query: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [elections, total] = await Promise.all([
      prisma.election.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
        include: {
          electionType: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          candidates: {
            select: {
              id: true,
              name: true,
              party: true,
            },
          },
          _count: {
            select: {
              votes: true,
              commissioners: true,
            },
          },
        },
      }),
      prisma.election.count({ where }),
    ]);

    return {
      data: elections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getAllElections() {
    const elections = await prisma.election.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        electionType: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        candidates: {
          select: {
            id: true,
            name: true,
            party: true,
          },
        },
        commissioners: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            eligibleVoters: true,
            votes: true,
          },
        },
      },
    });

    return elections;
  }

  async getElectionsForUser(userId?: string, userRole?: string) {
    // If no user is provided or user is admin, return all elections
    if (!userId || userRole === "ADMIN") {
      return this.getAllElections();
    }

    // For regular users, only return elections they are eligible to vote in
    const eligibleElectionIds = (await prisma.$queryRaw`
      SELECT DISTINCT "electionId" 
      FROM eligible_voters 
      WHERE "userId" = ${userId}
    `) as Array<{ electionId: string }>;

    const electionIds = eligibleElectionIds.map((ev: any) => ev.electionId);

    if (electionIds.length === 0) {
      return []; // User has no eligible elections
    }

    const elections = await prisma.election.findMany({
      where: {
        id: {
          in: electionIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        electionType: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        candidates: {
          select: {
            id: true,
            name: true,
            party: true,
          },
        },
        commissioners: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    return elections;
  }

  async getElectionById(id: string, userId?: string) {
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        electionType: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        candidates: {
          orderBy: { position: "asc" },
        },
        commissioners: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Check if user has voted (if userId provided)
    let hasVoted = false;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_electionId: {
            userId,
            electionId: id,
          },
        },
      });
      hasVoted = !!vote;
    }

    return {
      ...election,
      hasVoted,
    };
  }

  async updateElection(
    id: string,
    data: {
      title?: string;
      description?: string;
      electionTypeId?: string;
      startDate?: string;
      endDate?: string;
      status?: ElectionStatus;
    }
  ) {
    const election = await prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Don't allow updates to active or completed elections
    if (election.status === ElectionStatus.COMPLETED) {
      throw createError("Cannot update completed elections", 400);
    }

    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.electionTypeId) updateData.electionTypeId = data.electionTypeId;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status) updateData.status = data.status;

    const updatedElection = await prisma.election.update({
      where: { id },
      data: updateData,
      include: {
        electionType: true,
        candidates: true,
      },
    });

    return updatedElection;
  }

  async deleteElection(id: string) {
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        votes: true,
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Don't allow deletion of elections with votes
    if (election.votes.length > 0) {
      throw createError("Cannot delete election with existing votes", 400);
    }

    await prisma.election.delete({
      where: { id },
    });

    return { message: "Election deleted successfully" };
  }

  async addCandidate(
    electionId: string,
    data: {
      name: string;
      party?: string;
      description?: string;
      imageUrl?: string;
      position?: number;
    }
  ) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    if (election.status === ElectionStatus.COMPLETED) {
      throw createError("Cannot add candidates to completed elections", 400);
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        electionId,
      },
    });

    return candidate;
  }

  async updateCandidate(
    candidateId: string,
    data: {
      name?: string;
      party?: string;
      description?: string;
      imageUrl?: string;
      position?: number;
    }
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { election: true },
    });

    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    if (candidate.election.status === ElectionStatus.COMPLETED) {
      throw createError("Cannot update candidates in completed elections", 400);
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data,
    });

    return updatedCandidate;
  }

  async deleteCandidate(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        election: true,
        votes: true,
      },
    });

    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    if (candidate.votes.length > 0) {
      throw createError("Cannot delete candidate with existing votes", 400);
    }

    await prisma.candidate.delete({
      where: { id: candidateId },
    });

    return { message: "Candidate deleted successfully" };
  }

  async castVote(userId: string, electionId: string, candidateId: string) {
    // Get election details
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: true,
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Check if election is active
    if (election.status !== ElectionStatus.ACTIVE) {
      throw createError("Election is not currently active", 400);
    }

    // Check if current time is within election period
    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      throw createError("Election is not currently active", 400);
    }

    // Check if user is eligible to vote in this election
    const eligibleVoter = (await prisma.$queryRaw`
      SELECT id FROM eligible_voters 
      WHERE "userId" = ${userId} AND "electionId" = ${electionId}
    `) as Array<{ id: string }>;

    if (eligibleVoter.length === 0) {
      throw createError("You are not eligible to vote in this election", 403);
    }

    // Check if candidate exists and belongs to this election
    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      throw createError("Invalid candidate for this election", 400);
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_electionId: {
          userId,
          electionId,
        },
      },
    });

    if (existingVote) {
      throw createError("You have already voted in this election", 400);
    }

    // Cast vote
    const vote = await prisma.vote.create({
      data: {
        userId,
        electionId,
        candidateId,
        status: "CONFIRMED",
      },
    });

    return { message: "Vote cast successfully", voteId: vote.id };
  }

  async getElectionResults(electionId: string): Promise<ElectionResult> {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: true,
        votes: {
          include: {
            candidate: true,
          },
        },
        commissioners: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Calculate vote counts
    const voteCounts: Record<string, number> = {};
    election.candidates.forEach((candidate) => {
      voteCounts[candidate.id] = 0;
    });

    election.votes.forEach((vote) => {
      voteCounts[vote.candidateId]++;
    });

    const totalVotes = election.votes.length;
    const results = election.candidates.map((candidate) => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party || undefined,
      voteCount: voteCounts[candidate.id],
      percentage:
        totalVotes > 0 ? (voteCounts[candidate.id] / totalVotes) * 100 : 0,
    }));

    return {
      electionId: election.id,
      electionTitle: election.title,
      status: election.status,
      totalVotes,
      totalEligibleVoters: 0, // This would need to be calculated based on your business logic
      turnoutPercentage: 0, // Same here
      results,
      isPublished: election.isResultPublic,
      commissioners: election.commissioners.map((c) => ({
        userId: c.userId,
        userName: `${c.user.firstName} ${c.user.lastName}`,
        hasApproved: c.hasApproved,
        approvedAt: c.approvedAt || undefined,
      })),
    };
  }

  async addCommissioner(electionId: string, userId: string) {
    // Check if election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    // Check if user is already a commissioner
    const existingCommissioner = await prisma.electionCommissioner.findUnique({
      where: {
        userId_electionId: {
          userId,
          electionId,
        },
      },
    });

    if (existingCommissioner) {
      throw createError(
        "User is already a commissioner for this election",
        400
      );
    }

    const commissioner = await prisma.electionCommissioner.create({
      data: {
        userId,
        electionId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return commissioner;
  }

  async approveResults(electionId: string, commissionerId: string) {
    const commissioner = await prisma.electionCommissioner.findUnique({
      where: {
        userId_electionId: {
          userId: commissionerId,
          electionId,
        },
      },
      include: {
        election: true,
      },
    });

    if (!commissioner) {
      throw createError("Commissioner not found for this election", 404);
    }

    if (commissioner.hasApproved) {
      throw createError("Results already approved by this commissioner", 400);
    }

    // Check if election has ended
    const now = new Date();
    if (now < commissioner.election.endDate) {
      throw createError(
        "Cannot approve results. Election has not ended yet",
        400
      );
    }

    // Update commissioner approval
    await prisma.electionCommissioner.update({
      where: {
        userId_electionId: {
          userId: commissionerId,
          electionId,
        },
      },
      data: {
        hasApproved: true,
        approvedAt: new Date(),
      },
    });

    // Check if all commissioners have approved
    const allCommissioners = await prisma.electionCommissioner.findMany({
      where: { electionId },
    });

    const allApproved = allCommissioners.every((c) => c.hasApproved);

    if (allApproved) {
      // Publish results
      await prisma.election.update({
        where: { id: electionId },
        data: { isResultPublic: true },
      });

      return { message: "Results approved and published", published: true };
    }

    return {
      message: "Results approved. Waiting for other commissioners.",
      published: false,
    };
  }

  async getCommissionerElections(userId: string) {
    const commissionerElections = await prisma.electionCommissioner.findMany({
      where: {
        userId: userId,
      },
      include: {
        election: {
          include: {
            electionType: true,
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            candidates: {
              select: {
                id: true,
                name: true,
                party: true,
              },
            },
            _count: {
              select: {
                votes: true,
                commissioners: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include commissioner status
    return commissionerElections.map((commissioner) => ({
      ...commissioner.election,
      commissionerStatus: {
        hasApproved: commissioner.hasApproved,
        approvedAt: commissioner.approvedAt,
        assignedAt: commissioner.createdAt,
      },
    }));
  }
}
