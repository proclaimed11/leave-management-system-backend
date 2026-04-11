export interface ApplyLeaveTypeCard {
  type_key: string;
  name?: string;
  available_days: number | null;
  requires_document: boolean;
  requires_approval: boolean;
  approval_levels: number;
  deduct_from_balance: boolean;
}