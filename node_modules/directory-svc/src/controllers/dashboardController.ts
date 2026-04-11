import { RequestHandler } from "express";
import { DashboardEngine } from "../services/dashboardEngine";

const engine = new DashboardEngine();

export const getDashboardOverview: RequestHandler = async (req, res) => {
  try {
    const data = await engine.getOverview();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
