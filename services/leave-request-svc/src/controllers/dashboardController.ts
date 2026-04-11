import { Response } from "express";
import { dashboardEngineInstance } from "../services/dashboardEngine";
import { AuthRequest } from "../types/authRequest";
import { JwtUser } from "../types/types";

const engine = dashboardEngineInstance;

export const getMyDashboard = async (req: AuthRequest, res: Response) => {
  const me = req.user as JwtUser;

  try {
    const employeeNumber = me.employee_number;

    if (!employeeNumber) {
      return res
        .status(400)
        .json({ error: "employee_number missing in auth token" });
    }

    const data = await engine.getMyDashboard(employeeNumber);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getManagerDashboard = async (req: AuthRequest, res: Response) => {
  const me = req.user as JwtUser;

  try {
    const employeeNumber = me.employee_number;

    if (!employeeNumber) {
      return res
        .status(400)
        .json({ error: "employee_number missing in auth token" });
    }

    const data = await engine.getManagerDashboard(employeeNumber);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getHrDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as JwtUser;

    if (!user?.employee_number) {
      return res
        .status(400)
        .json({ error: "employee_number missing in auth token" });
    }

    const data = await engine.getHrDashboard();
    return res.json(data);
  } catch (err: any) {
    console.error("HR Dashboard error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};
export const getManagerTeamLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status as any;
    const search = req.query.search as string | undefined;

    const result = await engine.getTeamLeaves(me.employee_number, {
      page,
      limit,
      status,
      search,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
