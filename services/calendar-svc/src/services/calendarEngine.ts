import { CalendarRepository } from "../repositories/calendarRepository";
import { LeaveRequestApi } from "./leaveRequestService";
import { DirectoryApi } from "./directoryService";
import {
  ApprovedLeaveRow,
  DirectoryProfile,
  YearMonth,
  MonthlySnapshotInput
} from "../types/types";
import { expandApprovedLeaveIntoDays } from "../utils/calendarExpander";

export class CalendarEngine {
  private repo: CalendarRepository;
  private leaveApi: LeaveRequestApi;
  private directoryApi: DirectoryApi;

  constructor() {
    this.repo = new CalendarRepository();
    this.leaveApi = new LeaveRequestApi();
    this.directoryApi = new DirectoryApi();
  }

  /** -------------------------------------------------
   *  A) Rebuild calendar for a given month (YYYY-MM)
   * ------------------------------------------------- */
  async rebuildMonth(
    year_month: YearMonth,
    department?: string,
    authHeader?: string
  ) {
    // 1. Delete any previous month entries
    await this.repo.deleteMonth(year_month);

    // 2. Fetch employees
    const employees: DirectoryProfile[] = department
      ? await this.directoryApi.getEmployeesByDepartment(department, authHeader)
      : await this.directoryApi.getAllEmployees(authHeader);

    const employeeMap = new Map(
      employees.map((e) => [e.employee_number, e.department])
    );

    // 3. Fetch approved leaves for this month
    const approved: ApprovedLeaveRow[] =
      await this.leaveApi.getApprovedLeavesByMonth(year_month, authHeader);

    // 4. Expand leaves into day rows
    const expandedDays = expandApprovedLeaveIntoDays(approved);

    // 5. Write into calendar_days table
    for (const row of expandedDays) {
      const dept =
        department ??
        employeeMap.get(row.employee_number) ??
        "UNKNOWN";

      await this.repo.insertCalendarDay(
        row.calendar_date,
        row.employee_number,
        dept,
        row.leave_type_key
      );
    }

    // 6. Insert monthly snapshot (for analytics)
    const snapshotInput: MonthlySnapshotInput = {
      department: department ?? "ALL",
      year_month,
      total_employees: employees.length,
      total_leaves: approved.length
    };

    const snapshot = await this.repo.insertSnapshot(snapshotInput);

    return {
      message: "Calendar rebuilt successfully",
      snapshot
    };
  }

  /** -------------------------------------------------
   *  B) Get month view (raw list of calendar_days)
   * ------------------------------------------------- */
  async getMonth(year_month: YearMonth) {
    const days = await this.repo.getMonth(year_month);

    return {
      year_month,
      count: days.length,
      days
    };
  }

  /** -------------------------------------------------
   *  C) Department conflicts (>= threshold leaves)
   * ------------------------------------------------- */
  async getDepartmentConflicts(
    department: string,
    threshold: number
  ) {
    const conflicts = await this.repo.getDepartmentConflicts(
      department,
      threshold
    );

    return {
      department,
      threshold,
      conflicts
    };
  }

  /** -------------------------------------------------
   *  D) Snapshot analytics (up to 24 months)
   * ------------------------------------------------- */
  async getSnapshots(department: string) {
    const snapshots = await this.repo.getSnapshots(department);

    return {
      department,
      count: snapshots.length,
      snapshots
    };
  }
}
