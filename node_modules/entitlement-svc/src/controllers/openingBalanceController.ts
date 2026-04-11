import { Request, Response } from "express";
import { OpeningBalanceEngine } from "../services/openingBalanceEngine";

const engine = new OpeningBalanceEngine();


export const previewOpeningBalance = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    if (!req.file.originalname.endsWith(".csv")) {
      return res.status(400).json({ error: "Only CSV files are supported" });
    }

    const result = await engine.preview(
      req.file.originalname,
      req.file.buffer
    );

    return res.json(result);
  } catch (err: any) {
    console.error("Opening balance preview error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const commitOpeningBalance = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const result = await engine.commitFromCsv(
    req.file.originalname,
    req.file.buffer
  );

  res.json(result);
};

