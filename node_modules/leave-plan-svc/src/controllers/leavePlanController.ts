import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { JwtUser } from "../types/types";
import { LeavePlanEngine } from "../services/leavePlanEngine";
import {
  CreateLeavePlanInput,
  UpdateLeavePlanInput,
} from "../types/types";

const engine = new LeavePlanEngine();


export async function createLeavePlan(req: AuthRequest, res: Response) {
  try {
    const me = req.user as JwtUser;
    const payload = req.body as CreateLeavePlanInput;

    const result = await engine.createPlan(me, payload);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}


export async function listMyLeavePlans(req: AuthRequest, res: Response) {
  try {
    const me = req.user as JwtUser;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const status = req.query.status as
      | "PLANNED"
      | "CANCELLED"
      | "CONVERTED"
      | undefined;

    const year = req.query.year
      ? Number(req.query.year)
      : undefined;

    const result = await engine.listMyPlans(me, {
      page,
      limit,
      status,
      year,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateLeavePlan(req: AuthRequest, res: Response) {
  try {
    const me = req.user as JwtUser;
    const planId = Number(req.params.id);
    const payload = req.body as UpdateLeavePlanInput;

    const result = await engine.updatePlan(me, planId, payload);

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function deleteLeavePlan(req: AuthRequest, res: Response) {
  try {
    const me = req.user as JwtUser;
    const planId = Number(req.params.id);

    await engine.cancelPlan(me, planId);

    return res.json({ message: "Leave plan cancelled successfully" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function convertLeavePlan(req: AuthRequest, res: Response) {
  try {
    const me = req.user as JwtUser;
    const planId = Number(req.params.id);

    const result = await engine.convertPlan(me, planId);

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
export async function getManagerPlannedLeaves(
  req: AuthRequest,
  res: Response
) {
  const me = req.user as JwtUser;

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search?.toString();

  const result = await engine.getManagerPlannedLeaves(
    me.employee_number,
    { page, limit, search }
  );

  return res.json(result);
}

