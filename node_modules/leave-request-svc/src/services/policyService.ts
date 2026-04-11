
import axios from "axios";
import { LeaveRuleRow } from "../types/types";
import { CONFIG } from "../utils/config";
interface LeaveTypesResponse {
  count: number;
  leave_types: LeaveRuleRow[];
}
export type HolidayDTO = {
  holiday_date: string; // YYYY-MM-DD
  name: string;
};
let cache: LeaveRuleRow[] | null = null;
let cacheAt = 0;
const TTL = 60_000; // 1 minute

export async function getLeaveTypesWithRules(): Promise<LeaveRuleRow[]> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;

  const res = await axios.get<LeaveTypesResponse>(
    `${CONFIG.POLICY_SVC_URL}/internal/leave/leave-types`,
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY!,
      },
    }
  );
  cache = res.data.leave_types ?? [];
  cacheAt = now;

  return cache;
}

export async function getHolidaysBetween(params: {
  start: string;      // YYYY-MM-DD
  end: string;        // YYYY-MM-DD
  company_key: string;
  location?: string | null;
}): Promise<HolidayDTO[]> {
  const res = await axios.get<{ holidays: HolidayDTO[] }>(
    `${CONFIG.POLICY_SVC_URL}/internal/leave/holidays/between`,
    {
      params: {
        start: params.start,
        end: params.end,
        company_key: params.company_key,
        location: params.location ?? undefined,
      },
      headers: {
        "x-internal-key": CONFIG.INTERNAL_KEY,
      },
    },
  );

  return res.data.holidays ?? [];
}
