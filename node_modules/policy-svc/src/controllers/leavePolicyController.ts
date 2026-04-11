import { Request, Response } from "express";
import { LeavePolicyEngine } from "../services/leavePolicyEngine";

const engine = new LeavePolicyEngine();

/* ======================================================
   LEAVE TYPES
   ====================================================== */

export const listLeaveTypes = async (_req: Request, res: Response) => {
  try {
    const types = await engine.listLeaveTypes();
    return res.json({ count: types.length, leave_types: types });
  } catch (err: any) {
    console.error("listLeaveTypes error:", err);
    return res.status(500).json({ error: err.message });
  }
};
export const listLeaveTypesInternal = async (_req: Request, res: Response) => {
  try {
    const types = await engine.listLeaveTypesInternal();
    return res.json({ count: types.length, leave_types: types });
  } catch (err: any) {
    console.error("listLeaveTypes error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getLeaveType = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const type = await engine.getLeaveType(typeKey);

    if (!type) return res.status(404).json({ error: "Leave type not found" });

    return res.json(type);
  } catch (err: any) {
    console.error("getLeaveType error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const created = await engine.createLeaveType(req.body);

    return res.status(201).json({
      message: "Leave type created successfully",
      leave_type: created,
    });
  } catch (err: any) {
    console.error("createLeaveType error:", err);
    const isClient = /required|exists|invalid/i.test(err.message);
    return res.status(isClient ? 400 : 500).json({ error: err.message });
  }
};

export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const updated = await engine.updateLeaveType(typeKey, req.body);

    return res.json({
      message: "Leave type updated successfully",
      leave_type: updated,
    });
  } catch (err: any) {
    console.error("updateLeaveType error:", err);
    const isClient = /not found|invalid|required/i.test(err.message);
    return res.status(isClient ? 400 : 500).json({ error: err.message });
  }
};

export const disableLeaveType = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const updated = await engine.disableLeaveType(typeKey);

    return res.json({
      message: "Leave type disabled",
      leave_type: updated,
    });
  } catch (err: any) {
    console.error("disableLeaveType error:", err);
    const isClient = /not found/i.test(err.message);
    return res.status(isClient ? 400 : 500).json({ error: err.message });
  }
};

/* ======================================================
   LEAVE RULES
   ====================================================== */

export const getLeaveRules = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const rules = await engine.getRulesForType(typeKey);
    return res.json(rules);
  } catch (err: any) {
    console.error("getLeaveRules error:", err);
    const isClient = /not found/i.test(err.message);
    return res.status(isClient ? 404 : 500).json({ error: err.message });
  }
};

export const createLeaveRules = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      type_key: req.params.type_key.toUpperCase(),
    };
    if (req.params.type_key.toUpperCase() == "COMP_OFF") {
      throw new Error("COMP-OFF rules must be managed via comp-off rules");
    }
    const created = await engine.createLeaveRules(payload);

    return res.status(201).json({
      message: "Leave rules created",
      rules: created,
    });
  } catch (err: any) {
    console.error("createLeaveRules error:", err);
    const isClient = /required|exists|invalid/i.test(err.message);
    return res.status(isClient ? 400 : 500).json({ error: err.message });
  }
};

export const updateLeaveRules = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const updated = await engine.updateLeaveRules(typeKey, req.body);

    return res.json({
      message: "Leave rules updated successfully",
      rules: updated,
    });
  } catch (err: any) {
    console.error("updateLeaveRules error:", err);
    const isClient = /not found|invalid|required/i.test(err.message);
    return res.status(isClient ? 400 : 500).json({ error: err.message });
  }
};

/* ======================================================
   FULL POLICY (Admin / HR)
   ====================================================== */

export const getFullPolicy = async (_req: Request, res: Response) => {
  try {
    const data = await engine.getFullPolicy();
    return res.json(data);
  } catch (err: any) {
    console.error("getFullPolicy error:", err);
    return res.status(500).json({ error: err.message });
  }
};
