import { io, type Socket } from "socket.io-client";
import { getEnv } from "../config/env";
import { api, forceRefreshToken, getAccessToken, getRefreshToken } from "./api";
import { isPondResourceRevocationError, isPondRevoked, reportRevokedPond } from "./pondAccessControl";

type SocketAck = { status: "success" | "error"; message?: string };

let socket: Socket | null = null;
let socketIdentityKey: string | null = null;
let socketAccessToken: string | null = null;
let lastObservedAccessToken: string | null = typeof window !== "undefined" ? getAccessToken() : null;
let hadDisconnected = false;
let authRecoveryPromise: Promise<void> | null = null;
let lastFailedAuthToken: string | null | undefined;

const parseTokenPayload = (token: string | null): { sub?: string; tokenVersion?: number; exp?: number } | null => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as { sub?: string; tokenVersion?: number; exp?: number };
  } catch {
    return null;
  }
};

const getTokenIdentityKey = (token: string | null): string | null => {
  if (!token) return null;
  const parsed = parseTokenPayload(token);
  if (!parsed) return token;
  return `${parsed.sub ?? ""}:${parsed.tokenVersion ?? ""}`;
};

const isJwtExpired = (token: string | null): boolean => {
  const parsed = parseTokenPayload(token);
  if (!parsed || typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) {
    return false;
  }
  return Date.now() >= parsed.exp * 1000;
};

const isWsAuthError = (error: unknown): boolean => {
  const message =
    typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";
  return (
    message.includes("xác thực websocket") ||
    message.includes("unauthorized") ||
    message.includes("jwt") ||
    message.includes("token")
  );
};

const recoverSocketAuth = async (failedToken: string | null): Promise<void> => {
  if (!getRefreshToken()) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  const latestToken = getAccessToken();
  if (latestToken && latestToken !== failedToken && !isJwtExpired(latestToken)) {
    syncSocketWithAccessToken();
    return;
  }

  if (lastFailedAuthToken === failedToken && failedToken !== null) return;
  if (authRecoveryPromise) return authRecoveryPromise;

  lastFailedAuthToken = failedToken;
  authRecoveryPromise = (async () => {
    try {
      if (!failedToken || isJwtExpired(failedToken)) {
        await forceRefreshToken();
      } else {
        // When a locally non-expired token fails WS handshake, probe /auth/me first so
        // server-side expiry/revocation/clock-skew cleanly triggers 401 -> refresh/logout,
        // without corrupting sessions under partial HTTP-only test mocks.
        await api("/auth/me");
      }
    } catch {
      // api.ts already cleans up invalid sessions (401/403) or invalidates accessToken on network/5xx errors.
    } finally {
      authRecoveryPromise = null;
    }
  })();

  return authRecoveryPromise;
};

const syncSocketWithAccessToken = () => {
  const token = getAccessToken();
  const tokenChanged = token !== lastObservedAccessToken;
  lastObservedAccessToken = token;

  if (!token) {
    disconnectTelemetrySocket();
    return;
  }

  lastFailedAuthToken = undefined;
  const nextIdentity = getTokenIdentityKey(token);
  const needsReplacement =
    socket !== null && (socketAccessToken !== token || socketIdentityKey !== nextIdentity);

  if (needsReplacement) {
    disconnectTelemetrySocket();
    window.dispatchEvent(new Event("telemetry-socket-reset"));
    return;
  }

  if (!socket && tokenChanged) {
    window.dispatchEvent(new Event("telemetry-socket-reset"));
    return;
  }

  if (socket && !socket.connected) {
    if (isJwtExpired(token)) {
      void recoverSocketAuth(token);
    } else {
      socket.connect();
    }
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("auth-cleared", () => {
    lastObservedAccessToken = null;
    disconnectTelemetrySocket();
  });

  window.addEventListener("storage", () => {
    syncSocketWithAccessToken();
  });

  window.addEventListener("auth-token-refreshed", () => {
    syncSocketWithAccessToken();
  });

  window.addEventListener("online", () => {
    const token = getAccessToken();
    if (!token || isJwtExpired(token)) {
      if (getRefreshToken()) {
        void recoverSocketAuth(token);
      }
      window.dispatchEvent(new Event("ponds-updated"));
      return;
    }
    if (socket && !socket.connected) {
      socket.connect();
    } else if (!socket) {
      window.dispatchEvent(new Event("telemetry-socket-reset"));
    }
    window.dispatchEvent(new Event("ponds-updated"));
  });
}

const getSocketConfig = () => {
  const { wsUrl, wsPath, wsNamespace } = getEnv();
  return {
    namespaceUrl: `${wsUrl}${wsNamespace}`,
    path: wsPath,
  };
};

export const getTelemetrySocket = (): Socket | null => {
  const token = getAccessToken();
  lastObservedAccessToken = token;
  if (!token) {
    disconnectTelemetrySocket();
    return null;
  }

  if (isJwtExpired(token) && getRefreshToken()) {
    disconnectTelemetrySocket();
    void recoverSocketAuth(token);
    return null;
  }

  const identityKey = getTokenIdentityKey(token);
  if (socket && (socketAccessToken !== token || socketIdentityKey !== identityKey)) {
    disconnectTelemetrySocket();
  }

  if (!socket) {
    hadDisconnected = false;
    socketIdentityKey = identityKey;
    socketAccessToken = token;
    const boundToken = token;
    const { namespaceUrl, path } = getSocketConfig();
    socket = io(namespaceUrl, {
      path,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      auth: (callback) => callback({ token: getAccessToken() || "" }),
    });

    socket.on("disconnect", () => {
      hadDisconnected = true;
    });

    socket.on("connect", () => {
      lastFailedAuthToken = undefined;
      if (hadDisconnected) {
        hadDisconnected = false;
        window.dispatchEvent(new Event("ponds-updated"));
      }
    });

    socket.on("connect_error", (err) => {
      const currentToken = getAccessToken();
      if (isWsAuthError(err) || (currentToken && isJwtExpired(currentToken))) {
        void recoverSocketAuth(currentToken ?? boundToken);
      }
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
};

export const subscribeToPond = (pondId: string): (() => void) => {
  const activeSocket = getTelemetrySocket();
  if (!activeSocket || !pondId || isPondRevoked(pondId)) return () => undefined;

  let subscribed = false;
  let disposed = false;

  const subscribe = () => {
    if (disposed || !getAccessToken() || isPondRevoked(pondId)) {
      activeSocket.off("connect", subscribe);
      return;
    }
    activeSocket.emit("subscribe_pond", { pondId }, (ack: SocketAck) => {
      if (disposed) {
        if (ack?.status === "success" && activeSocket.connected) {
          activeSocket.emit("unsubscribe_pond", { pondId });
        }
        return;
      }
      subscribed = ack?.status === "success";
      if (ack?.status === "error" && isPondResourceRevocationError({ message: ack.message }, "ws-subscribe")) {
        subscribed = false;
        activeSocket.off("connect", subscribe);
        reportRevokedPond(pondId, ack.message);
      }
    });
  };

  if (activeSocket.connected) subscribe();
  activeSocket.on("connect", subscribe);

  return () => {
    disposed = true;
    activeSocket.off("connect", subscribe);
    if (subscribed && activeSocket.connected) {
      subscribed = false;
      activeSocket.emit("unsubscribe_pond", { pondId });
    }
  };
};

export const disconnectTelemetrySocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  socketIdentityKey = null;
  socketAccessToken = null;
  hadDisconnected = false;
};
