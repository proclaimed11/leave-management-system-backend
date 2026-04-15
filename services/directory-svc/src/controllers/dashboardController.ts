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

export const getCountryDashboardOverview: RequestHandler = async (req, res) => {
  try {
    const requested = String(req.query.country_prefix ?? "").trim().toUpperCase();
    const scope = (req as any).employee_visibility_scope as
      | { mode: "all" }
      | { mode: "none" }
      | { mode: "location"; location_prefix: string }
      | { mode: "location_department"; location_prefix: string; department: string }
      | undefined;

    if (!scope || scope.mode === "none") {
      return res.status(403).json({ error: "Forbidden" });
    }

    let effectiveCountry = requested;
    if (scope.mode === "location" || scope.mode === "location_department") {
      effectiveCountry = scope.location_prefix;
      if (requested && requested !== scope.location_prefix) {
        return res.status(403).json({ error: "Forbidden: cross-country access denied" });
      }
    }

    if (!effectiveCountry) {
      return res.status(422).json({ error: "country_prefix is required" });
    }

    const data = await engine.getCountryOverview(effectiveCountry);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
