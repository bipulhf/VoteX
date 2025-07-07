import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import env from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { socketAuthMiddleware } from "./middleware/socketAuth";
import { ChatSocketHandler } from "./utils/socketHandlers";

// Import routes
import authRoutes from "./routes/auth";
import electionTypeRoutes from "./routes/electionTypes";
import electionRoutes from "./routes/elections";
import userRoutes from "./routes/users";
import eligibleVoterRoutes from "./routes/eligibleVoters";
import reportRoutes from "./routes/reports";
import chatRoutes from "./routes/chat";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Initialize chat handler
const chatHandler = new ChatSocketHandler();

// Socket.IO authentication middleware
io.use(socketAuthMiddleware);

// Socket.IO connection handler
io.on("connection", (socket) => {
  chatHandler.handleConnection(io, socket as any);
});

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

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Voting System API is healthy",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/election-types", electionTypeRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/eligible-voters", eligibleVoterRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);

app.set("io", io);

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Voting System API running on port ${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`💬 Chat system enabled with Socket.IO`);
});

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
