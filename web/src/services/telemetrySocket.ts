import { io, type Socket } from "socket.io-client";
import { getAccessToken, getApiBaseUrl } from "./api";

type SocketAck = { status: "success" | "error"; message?: string };

let socket: Socket | null = null;

window.addEventListener("auth-cleared", () => disconnectTelemetrySocket());

const socketOrigin = () => {
  const configured = import.meta.env.VITE_SOCKET_URL || getApiBaseUrl();
  // In case a deployment supplies an API base ending in /api, Socket.IO still
  // connects to the backend origin and owns the /telemetry namespace itself.
  return configured.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

export const getTelemetrySocket = (): Socket | null => {
  if (!getAccessToken()) return null;

  if (!socket) {
    socket = io(`${socketOrigin()}/telemetry`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      auth: (callback) => callback({ token: getAccessToken() || "" }),
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
};

export const subscribeToPond = (pondId: string): (() => void) => {
  const activeSocket = getTelemetrySocket();
  if (!activeSocket || !pondId) return () => undefined;

  let subscribed = false;
  const subscribe = () => {
    activeSocket.emit("subscribe_pond", { pondId }, (ack: SocketAck) => {
      subscribed = ack?.status === "success";
    });
  };

  if (activeSocket.connected) subscribe();
  activeSocket.on("connect", subscribe);

  return () => {
    activeSocket.off("connect", subscribe);
    if (subscribed && activeSocket.connected) {
      activeSocket.emit("unsubscribe_pond", { pondId });
    }
  };
};

export const disconnectTelemetrySocket = () => {
  socket?.disconnect();
  socket = null;
};
