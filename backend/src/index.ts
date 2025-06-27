import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import env from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/auth";
import electionTypeRoutes from "./routes/electionTypes";
import electionRoutes from "./routes/elections";
import userRoutes from "./routes/users";
import eligibleVoterRoutes from "./routes/eligibleVoters";

const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(limiter);

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Voting System API is healthy",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/election-types", electionTypeRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/eligible-voters", eligibleVoterRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join election room for real-time updates
  socket.on("join-election", (electionId: string) => {
    socket.join(`election-${electionId}`);
    console.log(
      `User ${socket.id} joined election room: election-${electionId}`
    );
  });

  // Leave election room
  socket.on("leave-election", (electionId: string) => {
    socket.leave(`election-${electionId}`);
    console.log(`User ${socket.id} left election room: election-${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Store io instance globally for use in other modules
app.set("io", io);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Voting System API running on port ${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
