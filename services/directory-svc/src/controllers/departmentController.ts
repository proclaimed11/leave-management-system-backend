import { Request, Response } from "express";
import { DepartmentEngine } from "../services/departmentEngine";
import { validateCreateDepartment, validateUpdateDepartment } from "../validators/departmentValidator";

const engine = new DepartmentEngine();

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const input = validateCreateDepartment(req);
    const dept = await engine.create(input);
    return res.status(201).json({ message: "Department created", department: dept });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const listDepartments = async (req: Request, res: Response) => {
  try {
  const companyKey = req.query.company_key as string | undefined;

  const departments = await engine.listSummaries({
    company_key: companyKey,
  });

  res.json({
    count: departments.length,
    departments,
  });
}
  catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const dept = await engine.get(req.params.dept_key as string);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    return res.json(dept);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const patch = validateUpdateDepartment(req);
    console.log("Patch:", patch);
    const dept = await engine.update(req.params.dept_key as string, patch);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    return res.json({ message: "Department updated", department: dept });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    await engine.remove(req.params.dept_key as string);
    return res.json({ message: "Department deleted" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const setDepartmentHead = async (req: Request, res: Response) => {
  try {
    const { head_employee_number } = req.body as { head_employee_number: string | null };
    const dept = await engine.setHead(req.params.dept_key as string, head_employee_number ?? null);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    return res.json({ message: "Head updated", department: dept });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

