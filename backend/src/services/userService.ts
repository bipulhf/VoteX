import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";
import { PaginationQuery, PaginatedResponse } from "../types";
import { UserRole } from "@prisma/client";

export class UserService {
  async getUsers(query: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              votes: true,
              commissionerElections: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
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

  async getAllUsers() {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            votes: true,
            commissionerElections: true,
          },
        },
      },
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        votes: {
          include: {
            election: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                party: true,
              },
            },
          },
        },
        commissionerElections: {
          include: {
            election: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        createdElections: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    return user;
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deactivateUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        votes: true,
        commissionerElections: true,
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    // Don't allow deactivation if user has active commissioner roles
    const activeCommissionerRoles = user.commissionerElections.filter(
      (commission) => !commission.hasApproved
    );

    if (activeCommissionerRoles.length > 0) {
      throw createError(
        "Cannot deactivate user with active commissioner roles",
        400
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return {
      message: "User deleted successfully",
    };
  }
}
