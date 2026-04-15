import { Response } from "express";
import { LeaveEngine } from "../services/leaveEngine";
import {
  JwtUser,
  ApplyPayload,
} from "../types/types";
import { AuthRequest } from "../types/authRequest";
import { isClientError } from "../utils/errorClassifier";
import { mapDirectoryRoleToEmployeeRole } from "../types/roleMapper";
import { getEmployeeProfile } from "../services/directoryService";
import { LeaveApprovalEngine } from "../services/leaveApprovalEngine";

const engine = new LeaveEngine();
const approvalEngine = new LeaveApprovalEngine();

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;
    const authHeader = req.headers.authorization;

    const body = req.body as ApplyPayload;

    if (!body.leave_type_key)
      return res.status(400).json({ error: "leave_type_key is required" });
    if (!body.start_date || !body.end_date) {
      return res
        .status(400)
        .json({ error: "start_date and end_date are required (YYYY-MM-DD)" });
    }
    if (!body.handover_to)
      return res.status(400).json({ error: "handover_to is required" });

    if (body.handover_tasks && !Array.isArray(body.handover_tasks)) {
      return res.status(400).json({ error: "handover_tasks must be an array" });
    }
    if (Array.isArray(body.handover_tasks)) {
      for (const [i, t] of body.handover_tasks.entries()) {
        if (!t?.title || typeof t.title !== "string") {
          return res
            .status(400)
            .json({ error: `handover_tasks[${i}].title is required` });
        }
      }
    }

    const result = await engine.apply(authHeader, me, body);

    return res.json(result);
  } catch (err: any) {
    const msg =
      err?.response?.data?.error || err.message || "Internal server error";
    return res
      .status(isClientError(msg) ? 400 : 500)
      .json({ success: false, error: msg });
  }
};
export const uploadLeaveAttachment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const requestId = Number(req.params.request_id);

    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request_id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const result = await engine.uploadAttachment({
      request_id: requestId,
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    return res.status(201).json(result);
  } catch (err: any) {
    const msg = err.message || "Internal server error";
    const isClient = /invalid|required|not found|unauthorized/i.test(msg);
    return res.status(isClient ? 400 : 500).json({ error: msg });
  }
};

export const listLeaveAttachments = async (req: AuthRequest, res: Response) => {
  try {
    const requestId = Number(req.params.request_id);

    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request_id" });
    }

    const result = await engine.listAttachments(requestId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const me = (req as any).user as JwtUser;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await engine.getMyRequests(me, {
      page,
      limit,
      status,
      search,
    });

    return res.json({
      success: true,
      data: {
        employee_number: me.employee_number,
        page,
        limit,
        total: result.total,
        requests: result.requests,
      },
    });
  } catch (err: any) {
    const msg = err?.message || "Internal server error";
    return res.status(500).json({ success: false, error: msg });
  }
};

export const getOneRequest = async (req: AuthRequest, res: Response) => {
  try {
    const user = (req as any).user as JwtUser;
    const requestId = Number(req.params.request_id);

    if (!requestId) {
      return res.status(400).json({ error: "request_id is required" });
    }

    const profile = await getEmployeeProfile({
      employee_number: user.employee_number,
    });

    if (!profile || !profile.directory_role) {
      return res.status(403).json({
        error: "Unable to resolve employee role",
      });
    }

    const role = mapDirectoryRoleToEmployeeRole(
      profile.directory_role.toLowerCase(),
    );

    const viewer = {
      employee_number: user.employee_number as string,
      role,
    };

    const data = await engine.getLeaveRequestDetails(requestId, viewer);

    const isRequester = data.requester.employee_number === user.employee_number;
    const viewer_can_act = isRequester
      ? false
      : await approvalEngine.canViewerActOnRequest(requestId, viewer);

    return res.json({ ...data, viewer_can_act });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
};
export async function submitDraftLeaveRequest(
  req: AuthRequest,
  res: Response,
) {
  try {
    const me = req.user as JwtUser;
    const requestId = Number(req.params.id);

    if (Number.isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const result = await engine.submitDraft(
      req.headers.authorization,
      me,
      requestId,
      req.body,
    );

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

