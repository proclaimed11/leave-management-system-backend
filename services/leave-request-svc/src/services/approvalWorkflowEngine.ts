// src/approvals/approvalEngine.ts

import {
  ApprovalChainInput,
  ApprovalEmployee,
  ApprovalActor,
  BuiltWorkflowStep,
  BuildWorkflowResult,
  ActOnApprovalInput,
} from "../types/approval";
import { ApprovalRepository } from "../repositories/approvalRepository";

export interface ApprovalEngineDeps {
  getEmployeeByNumber: (
    employee_number: string
  ) => Promise<ApprovalEmployee | null>;

  updateRequestStatus: (
    request_id: number,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) => Promise<void>;

  /** When no HOD is found walking reports_to, resolve by company + department (directory_role = hod). */
  findDepartmentHod?: (
    companyKey: string,
    department: string,
  ) => Promise<ApprovalEmployee | null>;
}

export class ApprovalEngine {
  constructor(
    private readonly repo: ApprovalRepository,
    private readonly deps: ApprovalEngineDeps
  ) {}

  private async walkReportingChain(
    requester: ApprovalEmployee
  ): Promise<ApprovalEmployee[]> {
    const chain: ApprovalEmployee[] = [];

    let current: ApprovalEmployee | null = requester;

    const visited = new Set<string>([requester.employee_number]);
    const MAX_DEPTH = 20;

    while (current?.reports_to) {
      if (chain.length >= MAX_DEPTH) break;

      const managerEmpNo = current.reports_to;

      if (visited.has(managerEmpNo)) break;
      visited.add(managerEmpNo);

      const manager = await this.deps.getEmployeeByNumber(managerEmpNo);
      if (!manager) break;

      if (manager.employee_number === current.employee_number) break;

      chain.push(manager);
      current = manager;
    }

    return chain;
  }

  private applyPolicyStops(
    chain: ApprovalEmployee[],
    input: ApprovalChainInput
  ): {
    filtered: ApprovalEmployee[];
    policy: BuildWorkflowResult["meta"]["used_policy"];
  } {
    // HR + HOD both required; approval order is parallel (no sequence in DB).
    // Supervisor is excluded from workflow steps.
    const manager = chain.find((c) => c.role === "hod");

    let hr = chain.find((c) => c.role === "hr");

    if (!hr) {
      hr = {
        employee_number: "__HR_GROUP__",
        role: "hr",
        reports_to: null,
        department_id: null,
      };
    }

    const filtered: ApprovalEmployee[] = [];
    filtered.push(hr);
    if (manager) {
      filtered.push(manager);
    }

    return {
      filtered,
      policy: "PARALLEL_HR_AND_HOD",
    };
  }

  private toWorkflowSteps(chain: ApprovalEmployee[]): BuiltWorkflowStep[] {
    const seenEmpNos = new Set<string>();
    const unique = chain.filter((e) => {
      if (seenEmpNos.has(e.employee_number)) return false;
      seenEmpNos.add(e.employee_number);
      return true;
    });

    return unique.map((emp, idx) => ({
      step_order: idx + 1,
      role: emp.role,
      approver_emp_no:
        emp.role === "hr" || emp.role === "management" || emp.role === "hod"
          ? null
          : emp.employee_number,
    }));
  }

  async buildWorkflow(input: ApprovalChainInput): Promise<BuildWorkflowResult> {
    const reportingChain = await this.walkReportingChain(input.requester);

    let { filtered, policy } = this.applyPolicyStops(reportingChain, input);

    const hasHodStep = filtered.some((e) => e.role === "hod");
    if (
      !hasHodStep &&
      this.deps.findDepartmentHod &&
      input.requester.company_key &&
      input.requester.department
    ) {
      const deptHod = await this.deps.findDepartmentHod(
        input.requester.company_key,
        input.requester.department,
      );
      if (
        deptHod &&
        deptHod.employee_number !== input.requester.employee_number
      ) {
        const dup = filtered.some(
          (e) => e.employee_number === deptHod.employee_number,
        );
        if (!dup) {
          filtered = [...filtered, deptHod];
        }
      }
    }

    const steps = this.toWorkflowSteps(filtered);

    return {
      steps,
      meta: {
        used_reporting_chain_length: reportingChain.length,
        used_policy: policy,
      },
    };
  }

  private canActorApproveStep(step: any, actor: ApprovalActor): boolean {
    if (step.approver_emp_no) {
      return step.approver_emp_no === actor.employee_number;
    }
    return step.role === actor.role;
  }

  async actOnApproval(input: ActOnApprovalInput): Promise<void> {
    const step = await this.repo.getCurrentPendingStep(input.request_id);

    if (!step) {
      throw new Error("No pending approval step found");
    }
    if (
      step.approver_emp_no &&
      step.approver_emp_no === input.actor.employee_number
    ) {
      // This is still allowed for legitimate manager approvals; we only block if requester is same person
      // We don't have requester id here, so we don't hard block.
      // If you want strict blocking, pass requester employee_number in ActOnApprovalInput.
    }

    if (!this.canActorApproveStep(step, input.actor)) {
      throw new Error("Not authorized to act on this approval step");
    }

    await this.repo.actOnStep({
      step_id: step.id,
      actor_emp_no: input.actor.employee_number,
      action: input.action,
      remarks: input.remarks,
    });

    if (input.action === "REJECTED") {
      await this.deps.updateRequestStatus(input.request_id, "REJECTED");
      return;
    }

    const hasPending = await this.repo.hasPendingSteps(input.request_id);

    if (!hasPending) {
      await this.deps.updateRequestStatus(input.request_id, "APPROVED");
    }
  }
}
