import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";
import { PaginationQuery, PaginatedResponse } from "../types";

export class ElectionTypeService {
  async createElectionType(data: { name: string; description?: string }) {
    // Check if election type with same name already exists
    const existingType = await prisma.electionType.findUnique({
      where: { name: data.name },
    });

    if (existingType) {
      throw createError("Election type with this name already exists", 409);
    }

    const electionType = await prisma.electionType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return electionType;
  }

  async getElectionTypes(
    query: PaginationQuery
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true, // Only show active election types by default
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [electionTypes, total] = await Promise.all([
      prisma.electionType.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
        include: {
          _count: {
            select: {
              elections: true,
            },
          },
        },
      }),
      prisma.electionType.count({ where }),
    ]);

    return {
      data: electionTypes,
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

  async getAllElectionTypes() {
    const electionTypes = await prisma.electionType.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            elections: true,
          },
        },
      },
    });

    return electionTypes;
  }

  async getElectionTypeById(id: string) {
    const electionType = await prisma.electionType.findUnique({
      where: { id },
      include: {
        elections: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            elections: true,
          },
        },
      },
    });

    if (!electionType) {
      throw createError("Election type not found", 404);
    }

    return electionType;
  }

  async updateElectionType(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const electionType = await prisma.electionType.findUnique({
      where: { id },
    });

    if (!electionType) {
      throw createError("Election type not found", 404);
    }

    // Check for name uniqueness if name is being updated
    if (data.name && data.name !== electionType.name) {
      const existingType = await prisma.electionType.findUnique({
        where: { name: data.name },
      });

      if (existingType) {
        throw createError("Election type with this name already exists", 409);
      }
    }

    const updatedElectionType = await prisma.electionType.update({
      where: { id },
      data,
    });

    return updatedElectionType;
  }

  async deleteElectionType(id: string) {
    const electionType = await prisma.electionType.findUnique({
      where: { id },
      include: {
        elections: true,
      },
    });

    if (!electionType) {
      throw createError("Election type not found", 404);
    }

    // Don't allow deletion if there are elections using this type
    if (electionType.elections.length > 0) {
      throw createError(
        "Cannot delete election type with existing elections",
        400
      );
    }

    await prisma.electionType.delete({
      where: { id },
    });

    return { message: "Election type deleted successfully" };
  }
}
