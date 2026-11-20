/**
 * Matches the validator.js `isUUID(value)` behavior used by the Backend's
 * version-unspecified `@IsUUID()` DTO fields.  It intentionally accepts UUID
 * versions 1-8 with an RFC-compatible variant, plus nil/max UUIDs.
 */
const BACKEND_UUID_PATTERN = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export const isBackendUuid = (value: unknown): value is string =>
  typeof value === "string" && BACKEND_UUID_PATTERN.test(value);

export class InvalidPondIdError extends Error {
  readonly pondId: string;

  constructor(pondId: unknown) {
    const displayId = typeof pondId === "string" && pondId.length > 0 ? pondId : "(trống)";
    super(`Mã ao không hợp lệ (${displayId}). Không thể tải thiết bị cho ao này.`);
    this.name = "InvalidPondIdError";
    this.pondId = displayId;
  }
}

export function assertBackendPondId(pondId: unknown): asserts pondId is string {
  if (!isBackendUuid(pondId)) {
    throw new InvalidPondIdError(pondId);
  }
}
