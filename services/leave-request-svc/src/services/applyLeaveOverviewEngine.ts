import { getEntitlements } from "../services/entitlementService";
import { getLeaveTypesWithRules } from "../services/policyService";
import { ApplyLeaveTypeCard } from "../types/applyleaveOverview";

export class ApplyLeaveEngine {
  async getAvailableLeaveTypes(
    employeeNumber: string
  ): Promise<ApplyLeaveTypeCard[]> {
    const entitlements = await getEntitlements(employeeNumber);

    const leaveTypes = await getLeaveTypesWithRules();

    const entitlementMap = new Map(
      entitlements.map((e) => [e.leave_type_key, e])
    );

    return leaveTypes.map((rule) => {
      const ent = entitlementMap.get(rule.type_key);

      return {
        type_key: rule.type_key,
        name: rule.type_key
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),

        available_days: rule.deduct_from_balance
          ? ent?.remaining_days ?? 0
          : null, // unpaid / unlimited
        max_consecutive_days: rule.max_consecutive_days ?? null,
        max_per_year: rule.max_per_year ?? null,

        requires_document: Boolean(
          rule.requires_document || rule.attachment_required_after_days
        ),

        requires_approval: rule.requires_approval,
        approval_levels: rule.approval_levels ?? 1,
        deduct_from_balance: rule.deduct_from_balance,
      };
    });
  }
}