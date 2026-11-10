/**
 * Frontend representation of the permissions enforced by the API.
 * The API remains the source of truth; these helpers keep unavailable actions
 * out of the UI and prevent avoidable 403 responses.
 */
export type AppRole = "ADMIN" | "MANAGER" | "FARMER";

const MANAGEMENT_ROLES: readonly AppRole[] = ["ADMIN", "MANAGER"];

export const hasManagementAccess = (role?: string | null): boolean =>
  MANAGEMENT_ROLES.includes((role || "").toUpperCase() as AppRole);

export const canManagePonds = hasManagementAccess;
export const canManageDevices = hasManagementAccess;

/** All roles (Farmer, Manager, Admin) who have access to the device can report broken / faulty devices. */
export const canReportBrokenDevice = (role?: string | null): boolean => {
  const normalized = (role || "").toUpperCase();
  return normalized === "FARMER" || normalized === "MANAGER" || normalized === "ADMIN";
};

/** Mirrors the current Backend P0-4 target-user policy. */
export const canManageUser = (
  actorRole?: string | null,
  targetRole?: string | null,
): boolean => {
  const actor = (actorRole || "").toUpperCase();
  const target = (targetRole || "").toUpperCase();
  if (actor === "ADMIN") return true;
  return actor === "MANAGER" && target !== "ADMIN";
};

export const getRoleLabel = (role?: string | null): string => {
  switch ((role || "").toUpperCase()) {
    case "ADMIN":
      return "Quản trị viên";
    case "MANAGER":
      return "Quản lý";
    default:
      return "Nông dân";
  }
};

/** Admin is the frontend superuser and can open every protected page. */
export const canAccessRoute = (
  role?: string | null,
  allowedRoles?: readonly string[],
): boolean => {
  const normalizedRole = (role || "").toUpperCase();
  return normalizedRole === "ADMIN" || !allowedRoles?.length || allowedRoles.includes(normalizedRole);
};
