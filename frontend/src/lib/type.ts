export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Election = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  isResultPublic: boolean;
  createdAt: string;
  updatedAt: string;
  electionTypeId: string;
  createdById: string;
  electionType: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  candidates: Array<{
    id: string;
    name: string;
    party: string;
  }>;
  commissioners: Array<{
    id: string;
    hasApproved: boolean;
    approvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
    electionId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  _count: {
    eligibleVoters: number;
    votes: number;
  };
};

export type ElectionType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    elections: number;
  };
};

export type Report = {
  id: string;
  title: string;
  description: string;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
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
};

export type CreateReportData = {
  title: string;
  description: string;
  attachmentUrls?: string[];
  electionId: string;
};
