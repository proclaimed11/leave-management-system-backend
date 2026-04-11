import { Response } from "express";
import {
  getEmployeeProfile,
  getEmployeesByDepartment,
} from "../services/directoryService";
import { AuthRequest } from "../types/authRequest";
import { pool } from "../db/connection";

import { LeaveCalendarRepository } from "../repositories/calendarRepository";
import { LeaveCalendarService } from "../services/calendarEngine";

const calendarRepo = new LeaveCalendarRepository(pool);
const calendarService = new LeaveCalendarService(calendarRepo);

export async function getCalendar(req: AuthRequest, res: Response) {
  try {
    const user = (req as any).user;
    const role = (req as any).directory_role;

    const profile = await getEmployeeProfile({
      employee_number: user.employee_number,
    });
    const { start, end, department, company } = req.query;

    let companyKey = profile.company_key;
    let employeeNumbers: string[] | undefined;
    console.log("User profile:", role);

    if (["hr", "management", "consultant"].includes(role) && company) {
      companyKey = String(company);
    }

    if (role === "employee") {
      employeeNumbers = [user.employee_number];
    } else if (role === "supervisor" || role === "hod") {
      if (!profile.department) {
        return res.status(400).json({
          error: "Department not found for this user",
        });
      }

      const employees = await getEmployeesByDepartment({
        companyKey,
        department: profile.department,
      });

      employeeNumbers = employees.map((e) => e.employee_number);
    } else if (["hr", "management", "consultant"].includes(role)) {
      if (department) {
        const employees = await getEmployeesByDepartment({
          companyKey,
          department: String(department),
        });

        employeeNumbers = employees.map((e) => e.employee_number);
      } else {
        employeeNumbers = undefined;
      }
    } else {
      employeeNumbers = [user.employee_number];
    }
    const rows = await calendarService.getCalendarRange({
      companyKey,
      start: String(start),
      end: String(end),
      employeeNumbers,
    });

    return res.status(200).json(rows);
  } catch (error: any) {
    console.error("Calendar error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

export async function getCalendarCount(req: AuthRequest, res: Response) {
  try {
    const user = (req as any).user;
    const role = (req as any).directory_role?.toLowerCase();

    const { date, department, company } = req.query;

    if (!date) {
      return res.status(400).json({
        error: "date is required",
      });
    }

    const profile = await getEmployeeProfile({
      employee_number: user.employee_number,
    });

    if (!profile) {
      return res.status(404).json({
        error: "Employee profile not found",
      });
    }

    let companyKey = profile.company_key;

    if (["hr", "management", "consultant"].includes(role) && company) {
      companyKey = String(company).trim().toUpperCase();
    }

    let employeeNumbers: string[] | undefined;

    if (role === "employee") {
      employeeNumbers = [user.employee_number];
    } else if (role === "supervisor" || role === "hod") {
      if (!profile.department) {
        return res.status(400).json({
          error: "Department not found for this user",
        });
      }

      const employees = await getEmployeesByDepartment({
        companyKey,
        department: profile.department,
      });

      employeeNumbers = employees.map((e) => e.employee_number);
    } else if (["hr", "management", "consultant"].includes(role)) {
      if (department) {
        const employees = await getEmployeesByDepartment({
          companyKey,
          department: String(department),
        });

        employeeNumbers = employees.map((e) => e.employee_number);
      } else {
        employeeNumbers = undefined; // full company
      }
    } else {
      employeeNumbers = [user.employee_number];
    }

    const count = await calendarService.countApprovedOnDate({
      companyKey,
      date: String(date),
      employeeNumbers,
    });

    return res.status(200).json({ count });
  } catch (error: any) {
    console.error("Calendar count error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}
