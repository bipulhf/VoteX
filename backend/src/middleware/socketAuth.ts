import { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types";

export interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    // Get token from auth object or query parameters
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken =
      typeof token === "string" && token.startsWith("Bearer ")
        ? token.substring(7)
        : token;

    // Verify the token
    const decoded = verifyToken(cleanToken as string);

    // Attach user to socket
    (socket as AuthenticatedSocket).user = decoded;

    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};
