import { z } from "zod";

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Election Type validation schemas
export const createElectionTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateElectionTypeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Election validation schemas
export const createElectionSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    electionTypeId: z.string().min(1, "Election type is required"),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateElectionSchema = z
  .object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    electionTypeId: z.string().min(1, "Election type is required").optional(),
    startDate: z.string().datetime("Invalid start date").optional(),
    endDate: z.string().datetime("Invalid end date").optional(),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "CANCELLED"])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// Candidate validation schemas
export const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  party: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  position: z
    .number()
    .int()
    .min(0, "Position must be a positive integer")
    .optional(),
});

export const updateCandidateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  party: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  position: z
    .number()
    .int()
    .min(0, "Position must be a positive integer")
    .optional(),
});

// Vote validation schema
export const castVoteSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
});

// Commissioner validation schema
export const addCommissionerSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const electionIdParamSchema = z.object({
  electionId: z.string().min(1, "Election ID is required"),
});

// Eligible Voter validation schemas
export const bulkEligibleVotersSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required")
    .max(100, "Maximum 100 emails allowed"),
});

// Report validation schemas
export const createReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long"),
  attachmentUrls: z
    .array(z.string().url("Invalid attachment URL"))
    .max(10, "Maximum 10 attachments allowed")
    .optional(),
  electionId: z.string().min(1, "Election ID is required"),
});

export const updateReportSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long")
    .optional(),
  attachmentUrls: z
    .array(z.string().url("Invalid attachment URL"))
    .max(10, "Maximum 10 attachments allowed")
    .optional(),
});
