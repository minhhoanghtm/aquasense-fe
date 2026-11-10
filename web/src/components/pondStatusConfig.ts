export type PondHealthStatus = "NORMAL" | "WARNING" | "DANGER";

export const pondStatusConfig: Record<PondHealthStatus, { label: string; className: string }> = {
  NORMAL: { label: "Bình thường", className: "bg-cyan-950/70 text-cyan-400 border border-cyan-500/30" },
  WARNING: { label: "Cảnh báo", className: "bg-amber-950/70 text-amber-400 border border-amber-500/30" },
  DANGER: { label: "Nguy hiểm", className: "bg-rose-950/70 text-rose-400 border border-rose-500/30" },
};
