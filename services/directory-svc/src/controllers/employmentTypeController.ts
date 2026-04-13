import type { RequestHandler } from "express";
import { EmploymentTypeEngine } from "../services/employmentTypeEngine";

const engine = new EmploymentTypeEngine();

export const listEmploymentTypes: RequestHandler = async (_req, res) => {
  try {
    const types = await engine.listEmploymentTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
