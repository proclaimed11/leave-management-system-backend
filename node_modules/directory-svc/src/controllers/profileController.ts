import { Request, Response } from "express";
import { ProfileEngine } from "../services/profileEngine";

const engine = new ProfileEngine();

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user;
    const employeeNumber = me.employee_number;

    const profile = await engine.getMyProfile(employeeNumber);

    return res.json(profile);
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user;
    const employeeNumber = me.employee_number;

    const updated = await engine.updateMyProfile(employeeNumber, req.body);

    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
