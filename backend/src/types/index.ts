export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VotingStats {
  totalVotes: number;
  candidateVotes: Array<{
    candidateId: string;
    candidateName: string;
    imageUrl: string | null;
    party?: string;
    voteCount: number;
    percentage: number;
  }>;
}

export interface ElectionResult {
  electionId: string;
  electionTitle: string;
  status: string;
  totalVotes: number;
  totalEligibleVoters: number;
  turnoutPercentage: number;
  results: VotingStats["candidateVotes"];
  isPublished: boolean;
  publishedAt?: Date;
  commissioners: Array<{
    userId: string;
    userName: string;
    hasApproved: boolean;
    approvedAt?: Date;
  }>;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  attachmentUrls?: string[];
  electionId: string;
}

export interface UpdateReportRequest {
  title?: string;
  description?: string;
  attachmentUrls?: string[];
}

export interface ReportResponse {
  id: string;
  title: string;
  description: string;
  attachmentUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  reporterId: string;
  electionId: string;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  election: {
    id: string;
    title: string;
    status: string;
  };
}

// Prisma types will be available after installation and generation
