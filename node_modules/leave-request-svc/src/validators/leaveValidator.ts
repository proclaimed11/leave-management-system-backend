import dayjs from "dayjs";
import { DirectoryProfile, LeaveRule } from "../types/types";

export function assertDatesValid(start: string, end: string) {
  const s = dayjs(start),
    e = dayjs(end);
  if (!s.isValid() || !e.isValid())
    throw new Error("Invalid date format (YYYY-MM-DD)");
  if (e.isBefore(s)) throw new Error("end_date cannot be before start_date");
}

export function calcDaysInclusive(start: string, end: string) {
  const s = dayjs(start),
    e = dayjs(end);
  return e.diff(s, "day") + 1;
}

export const defaultRule: LeaveRule = {
  entitlement_days: null,
  max_consecutive_days: null,
  max_per_year: null,
  requires_approval: true,
  approval_levels: 2,
  paid: true,
  deduct_from_balance: true,
  requires_document: false,
  attachment_required_after_days: null,
  allow_weekends: false,
  allow_public_holidays: false,
  min_service_months: 0,
  gender_restriction: "any",
  notice_days_required: 0,
};

export function mergeRule(raw: Partial<LeaveRule> | undefined): LeaveRule {
  return { ...defaultRule, ...(raw || {}) };
}

export function validateWeekendPolicy(allowWeekends: boolean, start: string) {
  if (allowWeekends) return;
  const dow = dayjs(start).day(); // 0 Sun, 6 Sat
  if (dow === 0 || dow === 6) {
    throw new Error("Leave cannot start on a weekend");
  }
}

/** Normalize gender for comparison: directory may return "F", "FEMALE", "M", "MALE". */
function isFemale(gender: string | null | undefined): boolean {
  const g = (gender ?? "").toString().trim().toUpperCase();
  return g === "F" || g === "FEMALE";
}

function isMale(gender: string | null | undefined): boolean {
  const g = (gender ?? "").toString().trim().toUpperCase();
  return g === "M" || g === "MALE";
}

export function validateGenderRestriction(
  rule: LeaveRule,
  profile: DirectoryProfile,
) {
  if (rule.gender_restriction === "female" && !isFemale(profile.gender)) {
    throw new Error("This leave is restricted to female employees");
  }
  if (rule.gender_restriction === "male" && !isMale(profile.gender)) {
    throw new Error("This leave is restricted to male employees");
  }
}

export function validateServiceMonths(
  rule: LeaveRule,
  profile: DirectoryProfile,
) {
  if (!rule.min_service_months || !profile.date_of_joining) return;
  const doj = dayjs(profile.date_of_joining);
  const months = dayjs().diff(doj, "month");
  if (months < rule.min_service_months) {
    throw new Error(
      `You must complete at least ${rule.min_service_months} months of service`,
    );
  }
}

export function validateNotice(rule: LeaveRule, start: string) {
  if (!rule.notice_days_required) return;
  const daysNotice = dayjs(start)
    .startOf("day")
    .diff(dayjs().startOf("day"), "day");
  if (daysNotice < rule.notice_days_required) {
    throw new Error(`Notice period is ${rule.notice_days_required} days`);
  }
}

export function validateAttachments(
  rule: LeaveRule,
  attachment_id?: number | null,
) {
  if (rule.requires_document && !attachment_id) {
    throw new Error("Attachment/document is required for this leave");
  }
}
export function validateMaxConsecutiveDays(
  rule: LeaveRule,
  daysRequested: number,
) {
  if (!rule.max_consecutive_days) return;

  if (daysRequested > rule.max_consecutive_days) {
    throw new Error(
      `Maximum consecutive leave allowed is ${rule.max_consecutive_days} days`,
    );
  }
}
