import type { RequestHandler } from "express";
import { CountryEngine } from "../services/countryEngine";

const engine = new CountryEngine();

export const listCountries: RequestHandler = async (_req, res) => {
  try {
    const countries = await engine.listCountries();
    res.json(countries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
