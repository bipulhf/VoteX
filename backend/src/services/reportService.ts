import prisma from "../config/database";
import { createError } from "../middleware/errorHandler";
import { UserRole } from "@prisma/client";
import {
  CreateReportRequest,
  UpdateReportRequest,
  ReportResponse,
} from "../types";

export class ReportService {
  async createReport(
    data: CreateReportRequest,
    reporterId: string
  ): Promise<ReportResponse> {
    const election = await prisma.election.findUnique({
      where: { id: data.electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    const eligibleVoter = await prisma.eligibleVoter.findUnique({
      where: {
        userId_electionId: {
          userId: reporterId,
          electionId: data.electionId,
        },
      },
    });

    if (!eligibleVoter) {
      throw createError("You are not eligible to report on this election", 403);
    }

    const report = await prisma.report.create({
      data: {
        title: data.title,
        description: data.description,
        attachmentUrls: data.attachmentUrls || [],
        reporterId,
        electionId: data.electionId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return report;
  }

  async getReports(
    userRole: string,
    userId: string,
    search?: string
  ): Promise<ReportResponse[]> {
    if (userRole !== UserRole.ADMIN) {
      const isCommissioner = await prisma.electionCommissioner.findFirst({
        where: { userId },
      });

      if (!isCommissioner) {
        throw createError("Unauthorized to view reports", 403);
      }
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userRole !== UserRole.ADMIN) {
      const commissionerElections = await prisma.electionCommissioner.findMany({
        where: { userId },
        select: { electionId: true },
      });

      const electionIds = commissionerElections.map((ce) => ce.electionId);
      where.electionId = { in: electionIds };
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return reports;
  }

  async getReportById(
    id: string,
    userRole: string,
    userId: string
  ): Promise<ReportResponse> {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!report) {
      throw createError("Report not found", 404);
    }

    if (userRole !== UserRole.ADMIN && report.reporterId !== userId) {
      const isCommissioner = await prisma.electionCommissioner.findFirst({
        where: {
          userId,
          electionId: report.electionId,
        },
      });

      if (!isCommissioner) {
        throw createError("Unauthorized to view this report", 403);
      }
    }

    return report;
  }

  async updateReport(
    id: string,
    data: UpdateReportRequest,
    userId: string
  ): Promise<ReportResponse> {
    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw createError("Report not found", 404);
    }

    if (existingReport.reporterId !== userId) {
      throw createError("Unauthorized to update this report", 403);
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.attachmentUrls !== undefined && {
          attachmentUrls: data.attachmentUrls,
        }),
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return report;
  }

  async deleteReport(
    id: string,
    userId: string,
    userRole: string
  ): Promise<{ message: string }> {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw createError("Report not found", 404);
    }

    if (report.reporterId !== userId && userRole !== UserRole.ADMIN) {
      throw createError("Unauthorized to delete this report", 403);
    }

    await prisma.report.delete({
      where: { id },
    });

    return { message: "Report deleted successfully" };
  }

  async getReportsByElection(
    electionId: string,
    userRole: string,
    userId: string
  ): Promise<ReportResponse[]> {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw createError("Election not found", 404);
    }

    if (userRole !== UserRole.ADMIN) {
      const isCommissioner = await prisma.electionCommissioner.findFirst({
        where: {
          userId,
          electionId,
        },
      });

      if (!isCommissioner) {
        throw createError(
          "Unauthorized to view reports for this election",
          403
        );
      }
    }

    const reports = await prisma.report.findMany({
      where: { electionId },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return reports;
  }
}
