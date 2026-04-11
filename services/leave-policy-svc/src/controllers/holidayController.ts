import { Request, Response } from "express";
import { HolidayService } from "../services/holidayService";

const service = new HolidayService();
export const createHoliday = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // from auth middleware

    const holiday = await service.createHoliday(
      req.body,
      user?.employee_number
    );

    return res.status(201).json(holiday);
  } catch (err: any) {
    console.error("createHoliday error", err);
    return res.status(400).json({ error: err.message });
  }
};
export const listHolidays = async (req: Request, res: Response) => {
  try {
    const company_key = req.query.company_key as string | undefined;
    const year = req.query.year
      ? Number(req.query.year)
      : undefined;

    const holidays = await service.listHolidays({
      company_key,
      year,
    });

    return res.json({ holidays });
  } catch (err: any) {
    console.error("listHolidays error", err);
    return res.status(500).json({ error: err.message });
  }
};
export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await service.updateHoliday(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    return res.json(updated);
  } catch (err: any) {
    console.error("updateHoliday error", err);
    return res.status(400).json({ error: err.message });
  }
};
export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await service.deleteHoliday(id);

    return res.status(204).send();
  } catch (err: any) {
    console.error("deleteHoliday error", err);
    return res.status(400).json({ error: err.message });
  }
};
export const getHolidaysBetween = async (
  req: Request,
  res: Response
) => {
  try {
    const { start, end, company_key, location } = req.query;

    if (!start || !end || !company_key) {
      return res.status(400).json({
        error: "start, end and company_key are required",
      });
    }

    const holidays = await service.getHolidaysBetween({
      start: String(start),
      end: String(end),
      company_key: String(company_key),
      location: location ? String(location) : null,
    });

    return res.json({ holidays });
  } catch (err: any) {
    console.error("getHolidaysBetween error", err);
    return res.status(500).json({ error: err.message });
  }
};

