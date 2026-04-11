import { RequestHandler } from "express";
import { GenderEngine } from "../services/genderEngine";

const engine = new GenderEngine();

export const listGenders: RequestHandler = async (_req, res) => {
  try {
    const genders = await engine.listGenders();
    res.json({
      count: genders.length,
      genders,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch genders",
      message: err.message,
    });
  }
};
