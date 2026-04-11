// src/types/types.ts

export interface LeaveType {
  id: number;
  type_key: string;
  name: string;
  description?: string | null;
  default_days?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface LeaveRule {
  id: number;
  leave_type_id: number;
  entitlement_days?: number | null;
  max_consecutive_days?: number | null;
  max_per_year?: number | null;

  requires_approval?: boolean | null;
  approval_levels?: number | null;

  paid?: boolean | null;
  deduct_from_balance?: boolean | null;

  requires_document?: boolean | null;
  attachment_required_after_days?: number | null;

  allow_weekends?: boolean | null;
  allow_public_holidays?: boolean | null;

  min_service_months?: number | null;
  gender_restriction?: "male" | "female" | null;
  notice_days_required?: number | null;

  created_at: string;
}

export interface CreateLeaveTypeInput {
  type_key: string;
  name: string;
  description?: string | null;
  default_days?: number | null;
}

export interface UpdateLeaveTypeInput {
  name?: string;
  description?: string;
  default_days?: number;
}

// export interface CreateLeaveRuleInput {
//   leave_type_id: number;
//   type_key: string;

//   entitlement_days?: number | null;
//   max_consecutive_days?: number | null;
//   max_per_year?: number | null;

//   requires_approval?: boolean | null;
//   approval_levels?: number | null;

//   paid?: boolean | null;
//   deduct_from_balance?: boolean | null;

//   requires_document?: boolean | null;
//   attachment_required_after_days?: number | null;

//   allow_weekends?: boolean | null;
//   allow_public_holidays?: boolean | null;

//   min_service_months?: number | null;
//   gender_restriction?: "male" | "female" | null;
//   notice_days_required?: number | null;
// }
// types/leaveRules.ts
export interface CreateLeaveRuleRequest {
  type_key: string;

  entitlement_days?: number | null;
  max_consecutive_days?: number | null;
  max_per_year?: number | null;

  requires_approval?: boolean;
  approval_levels?: number;

  paid?: boolean;
  deduct_from_balance?: boolean;

  requires_document?: boolean;
  attachment_required_after_days?: number | null;

  allow_weekends?: boolean;
  allow_public_holidays?: boolean;

  min_service_months?: number;
  gender_restriction?: "any" | "male" | "female";

  notice_days_required?: number;
}
// types/leaveRules.ts
export interface CreateLeaveRuleInput {
  entitlement_days?: number | null;
  max_consecutive_days?: number | null;
  max_per_year?: number | null;

  requires_approval?: boolean;
  approval_levels?: number;

  paid?: boolean;
  deduct_from_balance?: boolean;

  requires_document?: boolean;
  attachment_required_after_days?: number | null;

  allow_weekends?: boolean;
  allow_public_holidays?: boolean;

  min_service_months?: number;
  gender_restriction?: "any" | "male" | "female";

  notice_days_required?: number;

  max_carry_forward_days?: number;
  allow_carry_forward?: boolean;
  carry_forward_expiry_days?: number;
  
}

export interface UpdateLeaveRuleInput {
  [key: string]: any; // dynamic fields
}
