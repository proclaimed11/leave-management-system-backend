import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { ApplyLeaveEngine } from "../services/applyLeaveOverviewEngine";
import { JwtUser } from "../types/types";

const engine = new ApplyLeaveEngine();

  export const getApplyLeaveOverview = async (req: AuthRequest, res: Response) => {
        const me = (req as any).user as JwtUser;

  try {
    const employeeNumber = me.employee_number;

    const data = await engine.getAvailableLeaveTypes(employeeNumber);

    res.json({
      count: data.length,
      leave_types: data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};