import { Request, Response, NextFunction } from "express";
import { getDirectoryEmployee } from "../client/directoryClient";

export const loadDirectoryRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (user.is_system_admin === true) {
    (req as any).directory_role = "admin";
    return next();
  }

  if (!user.employee_number) {
    res.status(403).json({ error: "Employee context required" });
    return;
  }

  try {
    const employee = await getDirectoryEmployee(
      { employee_number: user.employee_number },
    );

    if (employee.status !== "ACTIVE") {
      res.status(403).json({ error: "Employee inactive" });
      return;
    }

    (req as any).directory_role = employee.directory_role.toLowerCase();

    next();
  } catch (err) {
    res.status(403).json({ error: "Failed to resolve user role" });
  }
};
