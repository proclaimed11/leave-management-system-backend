"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandApprovedLeaveIntoDays = expandApprovedLeaveIntoDays;
function expandApprovedLeaveIntoDays(leaves) {
    const rows = [];
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
