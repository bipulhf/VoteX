import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface EligibleVoterWithUser {
  id: string;
  userId: string;
  electionId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified?: boolean;
  };
}

export class EligibleVoterService {
  async bulkAddEligibleVoters(electionId: string, emails: string[]) {
    // Verify election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Find users by emails
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Check which emails don't exist
    const foundEmails = users.map((user: User) => user.email);
    const notFoundEmails = emails.filter(
      (email) => !foundEmails.includes(email)
    );

    // Get existing eligible voters for this election
    const existingEligibleVoters = await prisma.eligibleVoter.findMany({
      where: {
        electionId,
        userId: {
          in: users.map((user: User) => user.id),
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const existingEmails = existingEligibleVoters.map((ev) => ev.user.email);
    const newUsers = users.filter(
      (user: User) => !existingEmails.includes(user.email)
    );

    // Create eligible voter records for new users
    const eligibleVotersData = newUsers.map((user: User) => ({
      userId: user.id,
      electionId,
    }));

    let addedUsers: Array<{ id: string; email: string; name: string }> = [];
    if (eligibleVotersData.length > 0) {
      // Use Prisma's createMany for bulk insert
      await prisma.eligibleVoter.createMany({
        data: eligibleVotersData,
      });

      addedUsers = newUsers.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      }));
    }

    return {
      success: true,
      added: addedUsers.length,
      alreadyExists: existingEmails.length,
      notFound: notFoundEmails.length,
      details: {
        addedUsers,
        existingEmails,
        notFoundEmails,
      },
    };
  }

  async bulkUpdateEligibleVoters(electionId: string, emails: string[]) {
    // Verify election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Find users by emails
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const foundEmails = users.map((user: User) => user.email);
    const notFoundEmails = emails.filter(
      (email) => !foundEmails.includes(email)
    );

    // Remove all existing eligible voters for this election
    await prisma.eligibleVoter.deleteMany({
      where: {
        electionId,
      },
    });

    // Add new eligible voters
    const eligibleVotersData = users.map((user: User) => ({
      userId: user.id,
      electionId,
    }));

    let eligibleUsers: Array<{ id: string; email: string; name: string }> = [];
    if (eligibleVotersData.length > 0) {
      // Use Prisma's createMany for bulk insert
      await prisma.eligibleVoter.createMany({
        data: eligibleVotersData,
      });

      eligibleUsers = users.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      }));
    }

    return {
      success: true,
      total: eligibleUsers.length,
      notFound: notFoundEmails.length,
      details: {
        eligibleUsers,
        notFoundEmails,
      },
    };
  }

  async getEligibleVoters(electionId: string) {
    // Verify election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    // Get eligible voters with user details
    const eligibleVoters = await prisma.eligibleVoter.findMany({
      where: {
        electionId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });

    // Check who has already voted
    const userIds = eligibleVoters.map((ev) => ev.userId);
    const votes = await prisma.vote.findMany({
      where: {
        electionId,
        userId: {
          in: userIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const votedUserIds = new Set(votes.map((vote) => vote.userId));

    const eligibleVotersWithStatus = eligibleVoters.map((ev) => ({
      id: ev.id,
      userId: ev.userId,
      email: ev.user.email,
      name: `${ev.user.firstName} ${ev.user.lastName}`,
      isEmailVerified: ev.user.isEmailVerified,
      hasVoted: votedUserIds.has(ev.userId),
      createdAt: ev.createdAt,
    }));

    return {
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
      },
      eligibleVoters: eligibleVotersWithStatus,
      summary: {
        total: eligibleVotersWithStatus.length,
        voted: votedUserIds.size,
        notVoted: eligibleVotersWithStatus.length - votedUserIds.size,
        verified: eligibleVotersWithStatus.filter((ev) => ev.isEmailVerified)
          .length,
      },
    };
  }
}
