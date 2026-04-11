import { RequestHandler } from "express";
import { MaritalStatusEngine } from "../services/maritalStatusEngine";

const engine = new MaritalStatusEngine();

export const listMaritalStatuses: RequestHandler = async (_req, res) => {
  try {
    const statuses = await engine.listMaritalStatuses();
    res.json({
      count: statuses.length,
      marital_statuses: statuses,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch marital statuses",
      message: err.message,
    });
  }
};
