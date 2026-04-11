// src/services/leavePolicyEngine.ts

import { LeaveTypeRepository } from "../repositories/leaveTypeRepository";
import { LeaveRuleRepository } from "../repositories/leaveRuleRepository";
import {
  CreateLeaveTypeInput,
  CreateLeaveRuleInput,
  UpdateLeaveRuleInput,
  UpdateLeaveTypeInput
} from "../types/types";
import { LeavePolicyValidator } from "../validators/leavePolicyValidator";

export class LeavePolicyEngine {

  private typeRepo = new LeaveTypeRepository();
  private ruleRepo = new LeaveRuleRepository();

  /** -------------------------------
   *  LEAVE TYPES
   * -------------------------------- */
  async listLeaveTypesInternal() {
    return this.typeRepo.listActiveRules();
  }
  async listLeaveTypes() {
    return this.typeRepo.getAll();
  }

  async getLeaveType(typeKey: string) {
    return this.typeRepo.getByTypeKey(typeKey);
  }

  async createLeaveType(data: CreateLeaveTypeInput) {
    LeavePolicyValidator.validateCreateLeaveType(data);

    const exists = await this.typeRepo.exists(data.type_key);
    if (exists) throw new Error("Leave type already exists");

    return this.typeRepo.create(data);
  }

  async updateLeaveType(type_key: string, data: UpdateLeaveTypeInput) {
    LeavePolicyValidator.validateUpdateLeaveType(data);

    const updated = await this.typeRepo.update(type_key, data);
    if (!updated) throw new Error("Leave type not found");

    return updated;
  }

  async disableLeaveType(type_key: string) {
    const disabled = await this.typeRepo.disable(type_key);
    if (!disabled) throw new Error("Leave type not found");

    return disabled;
  }

  /** -------------------------------
   *  LEAVE RULES
   * -------------------------------- */
  async getRulesForType(type_key: string) {
    const rules = await this.ruleRepo.getByTypeKey(type_key);
    if (!rules) throw new Error("Rules not found");
    return rules;
  }


  async createLeaveRules(data: CreateLeaveRuleInput & { type_key: string }) {
  LeavePolicyValidator.validateCreateLeaveRules(data);

  const type = await this.typeRepo.getByTypeKey(data.type_key);
  if (!type) throw new Error("Leave type not found");

  const exists = await this.ruleRepo.existsForType(type.id);
  if (exists) throw new Error("Rules already exist for this leave type");

  // ⬇️ REMOVE type_key before insert
  const { type_key, ...ruleData } = data;

  return this.ruleRepo.createRule(type.id, ruleData);
}

  async updateLeaveRules(type_key: string, data: UpdateLeaveRuleInput) {
    LeavePolicyValidator.validateUpdateLeaveRules(data);

    const updated = await this.ruleRepo.updateRule(type_key, data);
    if (!updated) throw new Error("Rules not found");

    return updated;
  }

  /** -------------------------------
   *  FULL POLICY (ADMIN)
   * -------------------------------- */
  async getFullPolicy() {
    const leave_types = await this.typeRepo.getAll();
    const leave_rules = await this.ruleRepo.getAll();

    // Comp-off rules might be added later
    return {
      leave_types,
      leave_rules,
      comp_off_rules: null
    };
  }
}
