import { Request, Response } from "express";
import { CompOffRulesEngine } from "../services/compOffRulesEngine";

const compOffEngine = new CompOffRulesEngine();


export const getCompOffRules = async (_req: Request, res: Response) => {
  try {
    const rules = await compOffEngine.getRules();

    return res.json({
      message: rules
        ? "Comp-off rules retrieved successfully"
        : "Comp-off rules not configured",
      rules,
    });
  } catch (e: any) {
    return res.status(500).json({
      error: e.message || "Internal server error",
    });
  }
};


export const createCompOffRules = async (req: Request, res: Response) => {
  try {
    const rules = await compOffEngine.createRules(req.body);

    return res.status(201).json({
      message: "Comp-off rules created successfully",
      rules,
    });
  } catch (e: any) {
    const code = /exists/i.test(String(e.message)) ? 409 : 422;
    return res.status(code).json({
      error: e.message || "Unable to create comp-off rules",
    });
  }
};


export const updateCompOffRules = async (req: Request, res: Response) => {
  try {
    const rules = await compOffEngine.updateRules(req.body);

    return res.json({
      message: "Comp-off rules updated successfully",
      rules,
    });
  } catch (e: any) {
    const code = /not found/i.test(String(e.message)) ? 404 : 422;
    return res.status(code).json({
      error: e.message || "Unable to update comp-off rules",
    });
  }
};
