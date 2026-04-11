import { Request, Response } from "express";
import { CalendarEngine } from "../services/calendarEngine";

const engine = new CalendarEngine();

/** ------------------------------------------
 *  POST /calendar/rebuild
 *  body: { year_month: "2025-12", department?: "Tech" }
 * ------------------------------------------ */
export const rebuildCalendar = async (req: Request, res: Response) => {
  try {
    const { year_month, department } = req.body;
    const authHeader = req.headers.authorization;

    if (!year_month) {
      return res.status(400).json({ error: "year_month is required (YYYY-MM)" });
    }

    const data = await engine.rebuildMonth(year_month, department, authHeader);

    return res.json(data);
  } catch (err: any) {
    console.error("rebuildCalendar error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/** ------------------------------------------
 *  GET /calendar/:year_month
 * ------------------------------------------ */
export const getCalendarMonth = async (req: Request, res: Response) => {
  try {
    const { year_month } = req.params;

    if (!year_month) {
      return res.status(400).json({ error: "year_month is required (YYYY-MM)" });
    }

    const data = await engine.getMonth(year_month);

    return res.json(data);
  } catch (err: any) {
    console.error("getCalendarMonth error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/** ------------------------------------------
 *  GET /calendar/conflicts/:department?threshold=3
 * ------------------------------------------ */
export const getDepartmentConflicts = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const threshold = Number(req.query.threshold) || 3;

    if (!department) {
      return res.status(400).json({ error: "department is required" });
    }

    const data = await engine.getDepartmentConflicts(department, threshold);

    return res.json(data);
  } catch (err: any) {
    console.error("getDepartmentConflicts error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/** ------------------------------------------
 *  GET /calendar/snapshots/:department
 * ------------------------------------------ */
export const getSnapshots = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;

    if (!department) {
      return res.status(400).json({ error: "department is required" });
    }

    const data = await engine.getSnapshots(department);

    return res.json(data);
  } catch (err: any) {
    console.error("getSnapshots error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};
