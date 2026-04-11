import { RequestHandler } from "express";
import { EmployeeImportEngine } from "../services/employeeImportEngine";

const engine = new EmployeeImportEngine();

export const previewEmployeeImport: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    if (!req.file.originalname.endsWith(".csv")) {
      return res.status(400).json({ error: "Only CSV files are supported" });
    }

    const summary = await engine.preview(
      req.file.originalname,
      req.file.buffer
    );

    res.json(summary);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to preview employee import",
      message: err.message,
    });
  }
};
export const commitEmployeeImport: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    if (!req.file.originalname.endsWith(".csv")) {
      return res.status(400).json({ error: "Only CSV files are supported" });
    }

    const result = await engine.commit(
      req.file.originalname,
      req.file.buffer
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to import employees",
      message: err.message,
    });
  }
};
