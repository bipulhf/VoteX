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

// Set max listeners to prevent memory leak warnings in development
// In development, we need more listeners due to frequent restarts
const maxListeners = env.NODE_ENV === "development" ? 30 : 15;
server.setMaxListeners(maxListeners);

const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Set max listeners for Socket.IO as well
io.setMaxListeners(maxListeners);

// Initialize chat handler
const chatHandler = new ChatSocketHandler();

// Socket.IO authentication middleware
io.use(socketAuthMiddleware);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  chatHandler.handleConnection(io, socket as any);

  // Add disconnect handler for cleanup
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
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
  console.log(`⚙️ Max event listeners set to: ${maxListeners}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  // Close Socket.IO connections first
  io.close((err) => {
    if (err) {
      console.error("Error closing Socket.IO server:", err);
    } else {
      console.log("Socket.IO server closed");
    }

    // Then close HTTP server
    server.close((err) => {
      if (err) {
        console.error("Error closing HTTP server:", err);
        process.exit(1);
      } else {
        console.log("HTTP server closed");
        process.exit(0);
      }
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing server close after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

export default app;
