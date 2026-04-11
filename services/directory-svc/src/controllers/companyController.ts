import { RequestHandler } from "express";
import { CompanyEngine } from "../services/companyEngine";

const engine = new CompanyEngine();

export const listCompanies: RequestHandler = async (_req, res) => {
  try {
    const companies = await engine.listCompanies();

    res.json({
      count: companies.length,
      companies,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch companies",
      message: err.message,
    });
  }
};
export const getCompanyOverview: RequestHandler = async (req, res) => {
  try {
    const companyKey = req.query.company_key as string | undefined;

    if (!companyKey) {
      return res.status(400).json({
        error: "company_key query parameter is required",
      });
    }

    const data = await engine.getOverview(companyKey);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
