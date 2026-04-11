import { RequestHandler } from "express";
import { EmployeeArchiveService } from "../services/employeeArchiveService";

const service = new EmployeeArchiveService();

export const archiveEmployee: RequestHandler = async (req, res) => {
  try {
    const { employee_number } = req.params;

    const result = await service.archive(employee_number as string);

    res.json({
      message: "Employee archived successfully",
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message,
    });
  }
};
