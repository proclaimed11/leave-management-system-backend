import {
  CreateLeaveTypeInput,
  CreateLeaveRuleInput,
  UpdateLeaveRuleInput,
  UpdateLeaveTypeInput
} from "../types/types";

export class LeavePolicyValidator {

  static validateCreateLeaveType(data: CreateLeaveTypeInput) {
    if (!data.type_key || typeof data.type_key !== "string") {
      throw new Error("type_key is required");
    }
    if (!data.name || typeof data.name !== "string") {
      throw new Error("name is required");
    }
  }

  static validateUpdateLeaveType(data: UpdateLeaveTypeInput) {
    if (
      !data.name &&
      !data.description &&
      data.default_days === undefined
    ) {
      throw new Error("At least one field must be updated");
    }
  }

  static validateCreateLeaveRules(data: CreateLeaveRuleInput) {
    if (!data.entitlement_days && data.entitlement_days !== 0) {
      throw new Error("entitlement_days is required");
    }
    if (data.gender_restriction &&
      !["any", "male", "female"].includes(data.gender_restriction)
    ) {
      throw new Error("Invalid gender restriction value");
    }
  }

  static validateUpdateLeaveRules(data: UpdateLeaveRuleInput) {
    if (Object.keys(data).length === 0) {
      throw new Error("No fields provided for update");
    }
  }
}
