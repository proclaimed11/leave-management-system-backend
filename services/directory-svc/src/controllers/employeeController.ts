import { Request, Response, NextFunction } from "express";
import { EmployeeEngine } from "../services/employeeEngine";

//Step:1 Added this to validate the create employee request
import { validateCreateEmployee } from "../validators/employeeValidator";

import { RequestHandler } from "express";

const engine = new EmployeeEngine();

export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const employee = await engine.createEmployee(req.body);
    // const identityResult = await onboardIdentityUser(employee);

    return res.json({
      message: "Employee created",
      employee,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const listEmployees: RequestHandler = async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;

    const filters = {
      page,
      limit,
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
      manager: req.query.manager as string | undefined,
      search: req.query.search as string | undefined,
      company_key: req.query.company_key as string | undefined,
    };

    const result = await engine.listEmployees(filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyProfile: RequestHandler = async (req, res) => {
  const me = (req as any).user;
  const profile = await engine.getMyProfile(me.email);

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
};

export const updateMyProfile: RequestHandler = async (req, res) => {
  const me = (req as any).user;

  const updated = await engine.updateMyPersonalDetails(
    me.employee_number,
    req.body
  );

  res.json({ message: "Profile updated", profile: updated });
};

export const updateEmployee: RequestHandler = async (req, res) => {
  const updated = await engine.updateCoreEmployee(
    req.params.employee_number as string,
    req.body
  );

  res.json({ message: "Employee updated", employee: updated });
};

export const getEmployeeById: RequestHandler = async (req, res) => {
  const emp = await engine.getById(req.params.employee_number as string);

  if (!emp) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(emp);
};
export const listManagerCandidates: RequestHandler = async (req, res) => {
  try {
    const department = req.query.department as string;

    if (!department) {
      return res.status(400).json({
        error: "department query param is required",
      });
    }

    const managers = await engine.listManagerCandidates(
      department.toUpperCase()
    );

    res.json({
      count: managers.length,
      managers,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

