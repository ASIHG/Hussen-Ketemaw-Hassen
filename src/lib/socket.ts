import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    // In production, the socket connects to the same host
    // In development, we use port 3000
    const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
    socket = io(URL as string, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const useRealtime = (callback: (data: any) => void) => {
  const s = getSocket();
  s.on("ai_update", callback);
  return () => {
    s.off("ai_update", callback);
  };
};
