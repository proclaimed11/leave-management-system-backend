import axios from "axios";
import { EntitlementRow } from "../types/types";
import { CONFIG } from "../utils/config";

interface DeductPayload {
  employee_number: string;
  leave_type_key: string;
  days: number;
  reason: string;
  source_request_id: number;
}

export async function getEntitlements(employeeNumber: string) {
  const r = await axios.get<{ entitlements: EntitlementRow[] }>(
    `${CONFIG.ENTITLEMENT_SVC_URL}/internal/entitlement/${encodeURIComponent(
      employeeNumber
    )}?year=${new Date().getFullYear()}`,
    {
      headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY! },
    }
  );
  return r.data.entitlements ?? [];
}

export async function generateEntitlementsForOne(employeeNumber: string) {
  const res = await axios.post(
    `${CONFIG.ENTITLEMENT_SVC_URL}/internal/entitlements/generate-for-one`,
    { employee_number: employeeNumber },
    {
      headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY! },
    }
  );

  return res.data;
}

export async function deductEntitlement(payload: DeductPayload) {
  const { ...data } = payload;
  const res = await axios.post(
    `${CONFIG.ENTITLEMENT_SVC_URL}/internal/entitlement/deduct`,
    data,
    {
      headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY! },
    }
  );

  return res.data;
}

