export function assertPositiveDays(days: unknown) {
  if (typeof days !== "number" || !Number.isFinite(days) || days <= 0) {
    throw new Error("days must be a positive number");
  }
}

export function normalizeTypeKey(key: string) {
  return key.trim().toUpperCase();
}
export function assertNonZeroDays(days: any) {
  if (days === undefined || days === null) {
    throw new Error("days is required");
  }

  const n = Number(days);

  if (!Number.isFinite(n)) {
    throw new Error("days must be a number");
  }

  if (!Number.isInteger(n)) {
    throw new Error("days must be a whole number");
  }

  if (n === 0) {
    throw new Error("days cannot be zero");
  }
}
