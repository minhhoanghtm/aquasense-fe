import { useEffect } from "react";
import { getTelemetrySocket, subscribeToPond } from "../services/telemetrySocket";

/** Keeps one authenticated Socket.IO connection and one authorized pond room. */
export const useTelemetryRealtime = (pondId?: string) => {
  useEffect(() => {
    if (!pondId) return;
    const socket = getTelemetrySocket();
    if (!socket) return;

    const unsubscribe = subscribeToPond(pondId);
    const onTelemetry = (data: unknown) => {
      window.dispatchEvent(new CustomEvent("telemetry-updated", { detail: { pondId, data } }));
    };
    const onAlert = (alert: unknown) => {
      const alertPondId = typeof alert === "object" && alert !== null && "pondId" in alert && typeof alert.pondId === "string"
        ? alert.pondId
        : pondId;
      window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { pondId: alertPondId, alert } }));
    };
    socket.on("telemetry:new", onTelemetry);
    socket.on("alert:triggered", onAlert);

    return () => {
      socket.off("telemetry:new", onTelemetry);
      socket.off("alert:triggered", onAlert);
      unsubscribe();
    };
  }, [pondId]);
};
