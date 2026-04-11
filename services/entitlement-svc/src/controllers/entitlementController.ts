import { Request, Response } from "express";
import { EntitlementEngine } from "../services/entitlementEngine";
import { normalizeTypeKey, assertPositiveDays, assertNonZeroDays } from "../validators/entitlementValidator";

const engine = new EntitlementEngine();

export const getMyEntitlements = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user;
    const year = new Date().getFullYear();
    const rows = await engine.myEntitlements(me.employee_number, year);
    return res.json(rows);
  } catch (e:any) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
};

export const getEmployeeEntitlements = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const rows = await engine.employeeEntitlements(req.params.employee_number, year);
    return res.json({ employee_number: req.params.employee_number, count: rows.length,  entitlements: rows });
  } catch (e:any) {
    const code = /not found/i.test(String(e.message)) ? 404 : 500;
    return res.status(code).json({ error: e.message || "Internal server error" });
  }
};

export const generateAllEntitlements = async (req: Request, res: Response) => {
  try {
    const { company_key } = req.body;

    const result = await engine.generateAll(company_key);

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateEntitlementsForOne = async (req: Request, res: Response) => {
  try {
    const { employee_number } = req.body;
    if (!employee_number) {
      return res.status(422).json({ error: "employee_number is required" });
    }

    const result = await engine.generateForOne(employee_number);

    return res.json(result);
  } catch (err: any) {
    const msg = err.message || "Internal server error";
    const isClient = /required|not found/i.test(msg);
    return res.status(isClient ? 400 : 500).json({ error: msg });
  }
};


export const adjustLeaveBalance = async (req: Request, res: Response) => {
  try {
    const { employee_number, leave_type_key, days, reason } = req.body ?? {};

    if (!employee_number)
      return res.status(422).json({ error: "employee_number is required" });

    if (!leave_type_key)
      return res.status(422).json({ error: "leave_type_key is required" });

    assertNonZeroDays(days);

    const out = await engine.adjustLeaveBalance(
      String(employee_number),
      normalizeTypeKey(String(leave_type_key)),
      Number(days),
      reason
    );

    return res.json(out);
  } catch (e: any) {
    const code = /required|negative|not found/i.test(String(e.message))
      ? 422
      : 500;
    return res.status(code).json({ error: e.message || "Internal server error" });
  }
};


export const deductEntitlement = async (req: Request, res: Response) => {
  try {
    const { employee_number, leave_type_key, days, reference_id, reason } = req.body ?? {};
    if (!employee_number) return res.status(422).json({ error: "employee_number is required" });
    if (!leave_type_key) return res.status(422).json({ error: "leave_type_key is required" });
    assertPositiveDays(days);

    const out = await engine.deduct(
      {
        employee_number: String(employee_number),
        leave_type_key: normalizeTypeKey(String(leave_type_key)),
        days: Number(days),
        reference_id: reference_id ?? null,
        reason: reason ?? null
      },
      req.headers.authorization
    );
    return res.json(out);
  } catch (e:any) {
    const code = /insufficient|required|not found|minimum/i.test(String(e.message)) ? 422 : 500;
    return res.status(code).json({ error: e.message || "Internal server error" });
  }
};

export const recordCompOffEarned = async (req: Request, res: Response) => {
  try {
    const { employee_number, date_worked, hours_worked, earned_days } = req.body ?? {};
    if (!employee_number || !date_worked || !hours_worked || !earned_days) {
      return res.status(422).json({ error: "employee_number, date_worked, hours_worked, earned_days are required" });
    }
    const out = await engine.recordCompOff(employee_number, date_worked, Number(hours_worked), Number(earned_days));
    return res.json(out);
  } catch (e:any) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
};

export const resetYearEntitlements = async (_req: Request, res: Response) => {
  try {
    const r = await engine.yearlyReset();
    return res.json(r);
  } catch (e:any) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
};
export const getEntitlementHistory = async (req: Request, res: Response) => {
  try {
    let { employee_number } = req.params;
    const { leave_type_key, year } = req.query;

    const data = await engine.getHistoryTimeline(
      employee_number,
      leave_type_key as string | undefined,
      year ? Number(year) : undefined,
    );

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
function mapEntitlement(e: any) {
  const isAnnual = e.leave_type_key === "ANNUAL";

  return {
    employee_number: e.employee_number,
    leave_type_key: e.leave_type_key,
    total_days: e.total_days,
    used_days: e.used_days,
    remaining_days: e.remaining_days,

    carry_forward: isAnnual ? e.carry_forward : null,

    last_updated: e.last_updated,
  };
}


