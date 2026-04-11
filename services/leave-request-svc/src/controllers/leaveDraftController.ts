// src/controllers/internalLeaveDraftController.ts

import { Request, Response } from "express";
import { LeaveDraftService } from "../services/leaveDraftEngine";

const service = new LeaveDraftService();

export async function createLeaveDraftInternal(
  req: Request,
  res: Response,
) {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    employee_number,
    leave_type_key,
    start_date,
    end_date,
    reason,
    source_plan_id,
  } = req.body;

  if (
    !employee_number ||
    !leave_type_key ||
    !start_date ||
    !end_date ||
    !source_plan_id
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const draft = await service.createDraft({
    employee_number,
    leave_type_key,
    start_date,
    end_date,
    reason: reason ?? null,
    source_plan_id,
  });

  return res.json({ id: draft.id });
}
