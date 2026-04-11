"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidMonth = assertValidMonth;
function assertValidMonth(month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error("Invalid month format. Expected YYYY-MM");
    }
}
