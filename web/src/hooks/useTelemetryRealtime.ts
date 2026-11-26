import { useEffect, useRef, useState } from "react";
import { disconnectTelemetrySocket, getTelemetrySocket, subscribeToPond } from "../services/telemetrySocket";
import { isPondRevoked } from "../services/pondAccessControl";

/**
 * Maintains an authenticated Socket.IO connection across all protected routes
 * whenever the current user is active and has pond/farm access (`enabled=true`).
 * Ensures token refresh or `online` recovery reconnects the socket even on routes
 * without pond-specific subscriptions (e.g., `/monitoring`, `/farms`, `/profile`).
 */
export const useTelemetrySession = (enabled: boolean) => {
  const [socketEpoch, setSocketEpoch] = useState(0);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    const handleReset = () => setSocketEpoch((epoch) => epoch + 1);
    window.addEventListener("telemetry-socket-reset", handleReset);
    return () => window.removeEventListener("telemetry-socket-reset", handleReset);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (wasEnabledRef.current) {
        wasEnabledRef.current = false;
        disconnectTelemetrySocket();
      }
      return;
    }

    wasEnabledRef.current = true;
    getTelemetrySocket();
  }, [enabled, socketEpoch]);
};

/** Keeps one authenticated Socket.IO connection and authorized pond room(s). */
export const useTelemetryRealtime = (pondId?: string | string[], allowedDeviceIds?: string[]) => {
  const [socketEpoch, setSocketEpoch] = useState(0);
  const serializedPondIds = Array.isArray(pondId) ? pondId.filter(Boolean).sort().join(",") : (pondId || "");
  const serializedDeviceIds = Array.isArray(allowedDeviceIds) ? allowedDeviceIds.filter(Boolean).sort().join(",") : "";
  const allowedDeviceIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    allowedDeviceIdsRef.current = serializedDeviceIds ? new Set(serializedDeviceIds.split(",")) : null;
  }, [serializedDeviceIds]);

  useEffect(() => {
    const handleReset = () => setSocketEpoch((epoch) => epoch + 1);
    window.addEventListener("telemetry-socket-reset", handleReset);
    return () => window.removeEventListener("telemetry-socket-reset", handleReset);
  }, []);

  useEffect(() => {
    const ids = (Array.isArray(pondId) ? pondId.filter(Boolean) : (pondId ? [pondId] : []))
      .filter((id) => !isPondRevoked(id));
    if (ids.length === 0) return;
    const socket = getTelemetrySocket();
    if (!socket) return;

    const unsubByPond = new Map<string, () => void>();
    ids.forEach((id) => {
      unsubByPond.set(id, subscribeToPond(id));
    });

    const extractEventPondId = (payload: unknown): string | undefined => {
      if (typeof payload === "object" && payload !== null && "pondId" in payload && typeof payload.pondId === "string") {
        return payload.pondId;
      }
      return undefined;
    };

    const extractEventDeviceId = (payload: unknown): string | undefined => {
      if (typeof payload === "object" && payload !== null && "deviceId" in payload && typeof payload.deviceId === "string") {
        return payload.deviceId;
      }
      return undefined;
    };

    const onTelemetry = (data: unknown) => {
      const explicitPondId = extractEventPondId(data);
      const dataPondId = explicitPondId ?? ids[0];
      if (!unsubByPond.has(dataPondId) || isPondRevoked(dataPondId)) return;
      if (!explicitPondId && allowedDeviceIdsRef.current) {
        const dataDeviceId = extractEventDeviceId(data);
        if (dataDeviceId && !allowedDeviceIdsRef.current.has(dataDeviceId)) return;
      }
      window.dispatchEvent(new CustomEvent("telemetry-updated", { detail: { pondId: dataPondId, data } }));
    };

    const onAlert = (alert: unknown) => {
      const alertPondId = extractEventPondId(alert) ?? ids[0];
      if (!unsubByPond.has(alertPondId) || isPondRevoked(alertPondId)) return;
      window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { pondId: alertPondId, alert } }));
    };

    const onPondRevoked = (event: Event) => {
      const revokedPondId = (event as CustomEvent<{ pondId?: string }>).detail?.pondId;
      if (!revokedPondId) return;
      const unsub = unsubByPond.get(revokedPondId);
      if (unsub) {
        unsub();
        unsubByPond.delete(revokedPondId);
      }
    };

    socket.on("telemetry:new", onTelemetry);
    socket.on("alert:triggered", onAlert);
    window.addEventListener("pond-access-revoked", onPondRevoked);

    return () => {
      socket.off("telemetry:new", onTelemetry);
      socket.off("alert:triggered", onAlert);
      window.removeEventListener("pond-access-revoked", onPondRevoked);
      unsubByPond.forEach((unsub) => unsub());
      unsubByPond.clear();
    };
  }, [serializedPondIds, socketEpoch]);
};
