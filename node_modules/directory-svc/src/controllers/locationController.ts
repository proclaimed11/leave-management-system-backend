import { RequestHandler } from "express";
import { LocationEngine } from "../services/locationEngine";

const engine = new LocationEngine();

export const listLocations: RequestHandler = async (_req, res) => {
  try {
    const locations = await engine.listLocations();
    res.json({
      count: locations.length,
      locations,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch locations",
      message: err.message,
    });
  }
};
