export interface ApplyLeaveTypeCard {
  type_key: string;
  name?: string;
  available_days: number | null;
  max_consecutive_days: number | null;
  max_per_year: number | null;
  requires_document: boolean;
  requires_approval: boolean;
  approval_levels: number;
  deduct_from_balance: boolean;
}