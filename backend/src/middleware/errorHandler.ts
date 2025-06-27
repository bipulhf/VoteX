import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../types";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  message: string,
  statusCode: number = 400
): AppError => {
  return new AppError(message, statusCode);
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: Record<string, string[]> | undefined;

  // Handle AppError (our custom errors)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = {};

    error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (!errors![path]) {
        errors![path] = [];
      }
      errors![path].push(err.message);
    });
  }
  // Handle Prisma errors
  else if (error.message.includes("Unique constraint")) {
    statusCode = 409;
    message = "Resource already exists";
  } else if (error.message.includes("Record not found")) {
    statusCode = 404;
    message = "Resource not found";
  }
  // Handle JWT errors
  else if (error.message.includes("jwt")) {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
    errors,
  };

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  } as ApiResponse);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
