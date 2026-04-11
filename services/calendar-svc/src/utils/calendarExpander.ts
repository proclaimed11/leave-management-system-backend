import { ApprovedLeaveRow } from "../types/types";

export function expandApprovedLeaveIntoDays(
  leaves: ApprovedLeaveRow[]
): {
  calendar_date: string;
  employee_number: string;
  leave_type_key: string;
}[] {
  const rows: any[] = [];

  for (const lv of leaves) {
    let cur = new Date(lv.start_date);
    const end = new Date(lv.end_date);

    while (cur <= end) {
      const dateStr = cur.toISOString().split("T")[0];

      rows.push({
        calendar_date: dateStr,
        employee_number: lv.employee_number,
        leave_type_key: lv.leave_type_key
      });

      cur.setDate(cur.getDate() + 1);
    }
  }

  return rows;
}
