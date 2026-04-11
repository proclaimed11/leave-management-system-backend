// src/controllers/managerController.ts

import { Request, Response } from "express";
import { ManagerEngine } from "../services/managerEngine";

const engine = new ManagerEngine();

export const getSubordinates = async (req: Request, res: Response) => {
  try {
    const managerId = req.params.manager_id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;

    const data = await engine.getSubordinates(managerId as string, page, limit);
    return res.json(data);

  } catch (err: any) {
    console.error("getSubordinates error", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getReportingChain = async (req: Request, res: Response) => {
  try {
    const empNo = req.params.employee_number;

    const data = await engine.getReportingChain(empNo as string);
    return res.json(data);

  } catch (err: any) {
    console.error("reportingChain error", err);
    return res.status(500).json({ error: err.message });
  }
};
