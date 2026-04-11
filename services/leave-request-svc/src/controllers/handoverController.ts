import { Request, Response } from "express";
import { HandoverEngine } from "../services/handoverEngine";
import { JwtUser } from "../types/types";
import { isClientError } from "../utils/errorClassifier";
import { getHandoverCandidates } from "../services/directoryService";
import { AuthRequest } from "../types/authRequest";

const engine = new HandoverEngine();

export const addHandoverTask = async (req: Request, res: Response) => {
  try {
    const { title, order_index } = req.body;
    const result = await engine.addTask(Number(req.params.request_id), {
      title,
      order_index,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const getHandoverTasks = async (req: Request, res: Response) => {
  try {
    const result = await engine.getTasks(Number(req.params.request_id));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
export const getMyHandoverTasks = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;
    const result = await engine.getMyTasks(me);

    return res.json({
      employee_number: me.employee_number,
      count: result.length,
      handovers: result,
    });
  } catch (err: any) {
    console.error("getMyHandoverTasks error:", err);
    return res.status(500).json({ error: err.message });
  }
};
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;
    const { is_completed } = req.body;

    const result = await engine.updateTask(
      Number(req.params.task_id),
      is_completed,
      me
    );
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
export const completeHandoverTask = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;
    const taskId = Number(req.params.task_id);

    if (!taskId) {
      return res.status(400).json({ error: "task_id is required" });
    }

    const result = await engine.completeTask(taskId, me);

    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    const msg = err.message || "Internal server error";
    const isClient = /cannot|not assigned|approved/i.test(msg);

    return res.status(isClient ? 400 : 500).json({
      success: false,
      error: msg,
    });
  }
};

export const getHandoverOptions = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;

    const employeeNumber = me.employee_number;

    const employees = await getHandoverCandidates(employeeNumber);

    res.json({
      count: employees.length,
      employees,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getMyReceivedHandovers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const me = req.user!;
    const {
      status,
      page = "1",
      limit = "10",
    } = req.query;

    const result = await engine.getReceivedHandovers({
      employee_number: me.employee_number,
      status: status as string | undefined,
      page: Number(page),
      limit: Number(limit),
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("getMyReceivedHandovers error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
export const getHandoverDetails = async (req: Request, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;
    const handoverId = Number(req.params.handover_id);

    if (!handoverId) {
      return res.status(400).json({ error: "handover_id is required" });
    }

    const data = await engine.getHandoverDetails(handoverId, me);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    const msg = err.message || "Internal server error";
    const isClient = /not found|access denied/i.test(msg);

    return res.status(isClient ? 404 : 500).json({
      success: false,
      error: msg,
    });
  }
};

