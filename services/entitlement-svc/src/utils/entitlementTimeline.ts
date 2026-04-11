import {
  EntitlementHistoryRow,
  HRHistoryResponse,
  HRLeaveTimeline,
} from "../types/types";

import {
  ACTION_LABELS,
  LEAVE_TYPE_NAMES,
} from "../constants/entitlementLabels";
export function buildHRFriendlyTimeline(
  employeeNumber: string,
  history: EntitlementHistoryRow[]
): HRHistoryResponse {
  const grouped: Record<string, HRLeaveTimeline> = {};
  console.log("History:", history);
  for (const h of history) {
    const leaveKey = h.leave_type_key;

    // Initialize group if missing
    if (!grouped[leaveKey]) {
      grouped[leaveKey] = {
        leave_type_key: leaveKey,
        leave_type: LEAVE_TYPE_NAMES[leaveKey] ?? leaveKey,
        events: [],
      };
    }

    grouped[leaveKey].events.push({
      date:
        h.created_at instanceof Date
          ? h.created_at.toISOString()
          : h.created_at,
      action: ACTION_LABELS[h.action] ?? h.action,
      reason: h.reason ?? "—",
      changed_by: h.changed_by ?? "System",
      change: `${h.days_changed > 0 ? "+" : ""}${h.days_changed} days`,
      from: Number(h.old_remaining),
      to: Number(h.new_remaining),
    });
  }

  // Sort events per leave type (newest first)
  for (const timeline of Object.values(grouped)) {
    timeline.events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  return {
    employee_number: employeeNumber,
    timelines: Object.values(grouped),
  };
}
