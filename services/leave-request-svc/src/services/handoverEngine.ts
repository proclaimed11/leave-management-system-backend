import { HandoverRepository } from "../repositories/handoverRepository";
import {
  JwtUser,
  CompleteTaskResult,
  HandoverQuery,
  HandoverCard,
} from "../types/types";
import { getEmployeeProfile } from "./directoryService";

export class HandoverEngine {
  constructor(private repo = new HandoverRepository()) {}

  async createHandoverForLeave(
    requestId: number,
    handoverTo: string,
    notes: string | null,
    docUrl: string | null
  ) {
    return await this.repo.createHandover(requestId, handoverTo, notes, docUrl);
  }

  async addTask(
    requestId: number,
    payload: { title: string; order_index?: number }
  ) {
    const record = await this.repo.getHandoverByRequest(requestId);
    if (!record) throw new Error("Handover record not found");

    return this.repo.createTask(record.id, payload);
  }
  async getTasks(requestId: number) {
    const record = await this.repo.getHandoverByRequest(requestId);
    if (!record) throw new Error("Handover record not found");

    const tasks = await this.repo.getTasks(record.id);

    return {
      handover: record,
      total_tasks: tasks.length,
      completed_tasks: tasks.filter((t) => t.is_completed).length,
      tasks,
    };
  }
  async getMyTasks(me: JwtUser) {
    const results = await this.repo.findTasksAssignedTo(me.employee_number);

    return results.map((item) => ({
      handover_id: item.handover.id,
      request_id: item.handover.request_id,
      handover_notes: item.handover.notes,
      document_url: item.handover.document_url,
      created_at: item.handover.created_at,
      total_tasks: item.tasks.length,
      completed_tasks: item.tasks.filter((t) => t.is_completed).length,
      tasks: item.tasks,
    }));
  }
  async updateTask(taskId: number, isCompleted: boolean, me: JwtUser) {
    const updated = await this.repo.updateTaskStatus(taskId, {
      is_completed: isCompleted,
      updated_by: me.employee_number,
    });

    if (!updated) throw new Error("Task not found");

    return updated;
  }
  async completeTask(taskId: number, me: JwtUser): Promise<CompleteTaskResult> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error("Task not found");

    const handover = await this.repo.findHandoverById(task.handover_id);
    if (!handover) throw new Error("Handover record missing");

    if (handover.handover_to !== me.employee_number) {
      throw new Error("You are not allowed to complete this task");
    }

    if (task.is_completed) {
      throw new Error("Task already completed");
    }

    const updated = await this.repo.markTaskCompleted(
      taskId,
      me.employee_number
    );

    return {
      task_id: updated.id,
      handover_id: updated.handover_id,
      title: updated.title,
      is_completed: updated.is_completed,
      completed_at: updated.completed_at,
    };
  }
  
  async getReceivedHandovers(query: HandoverQuery): Promise<{
    page: number;
    limit: number;
    count: number;
    handovers: HandoverCard[];
  }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const { rows, total } = await this.repo.findReceivedHandovers({
      employee_number: query.employee_number,
      status: query.status,
      limit,
      offset,
    });

    return {
      page,
      limit,
      count: total,
      handovers: rows,
    };
  }
  async getHandoverDetails(handoverId: number, me: JwtUser) {
    const detail = await this.repo.findHandoverDetails(
      handoverId,
      me.employee_number
    );

    if (!detail) {
      throw new Error("Handover not found or access denied");
    }

    const assignedByProfile = await getEmployeeProfile({
      employee_number: detail.assigned_by_employee_number,
    });
    const canActionTasks =
      detail.leave_status === "APPROVED" ||
      detail.leave_status === "HR_APPROVED";
    return {
      ...detail,
      assigned_by: {
        employee_number: assignedByProfile.employee_number,
        full_name: assignedByProfile.full_name,
        department: assignedByProfile.department,
      },
      canActionTasks
    };
  }
}
