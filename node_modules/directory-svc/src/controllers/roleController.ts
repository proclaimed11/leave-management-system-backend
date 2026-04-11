import { Request, Response, NextFunction } from "express";
import { RoleEngine } from "../services/roleEngine";
import { RequestHandler } from "express";
import { DirectoryRoleKey } from "../types/types";

const engine = new RoleEngine();

export const listRoles: RequestHandler = async (req, res) => {
  try {
    const roles = await engine.listAvailableRoles();
    res.json(roles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const assignEmployeeRole: RequestHandler = async (req, res) => {
  try {
    const { directory_role } = req.body;
    const empNo = req.params.employee_number as string;

    if (!directory_role) {
      return res.status(400).json({ error: "directory_role is required" });
    }

    const admin = (req as any).user; 

    const updated = await engine.assignRole(
      empNo,
      directory_role,
      admin.employee_number
    );

    res.json({
      message: "Role assigned successfully",
      employee: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export const listEmployeesByRole: RequestHandler = async (req, res) => {
  try {
    const role = req.query.role;
    if (!role || typeof role !== "string") {
      return res.status(400).json({ error: "role query param is required" });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = (req.query.search as string | undefined)?.trim();

    const result = await engine.listEmployeesByRole({
      roleKey: role as DirectoryRoleKey,
      page,
      limit,
      search,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listHodCandidates: RequestHandler = async (req, res) => {
  try {
    const department = req.query.department as string;

    if (!department) {
      return res.status(400).json({
        error: "department query param is required",
      });
    }

    const employees = await engine.listHodCandidates(department);

    res.json({
      count: employees.length,
      employees,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export const listSupervisorCandidates: RequestHandler = async (req, res) => {
  try {
    const department = req.query.department as string;

    if (!department) {
      return res.status(400).json({
        error: "department query param is required",
      });
    }

    const employees = await engine.listSupervisorCandidates(department);

    res.json({
      count: employees.length,
      employees,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

