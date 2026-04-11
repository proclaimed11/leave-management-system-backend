import { LeaveCalendarRepository } from "../repositories/calendarRepository";
import { LeaveCalendarRecord } from "../types/calendar";

type Cache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

export class LeaveCalendarService {
  constructor(
    private readonly repo: LeaveCalendarRepository,
    private readonly cache?: Cache
  ) {}

  async getCalendarRange(params: {
    companyKey: string;
    start: string;
    end: string;
    employeeNumbers?: string[];
  }): Promise<LeaveCalendarRecord[]> {
    const { companyKey, start, end, employeeNumbers } = params;

    if (!companyKey) throw new Error("companyKey is required");
    if (!start || !end) throw new Error("start and end are required");

    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(start) || !isoRegex.test(end)) {
      throw new Error("Dates must be YYYY-MM-DD");
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate < startDate) {
      throw new Error("end must be >= start");
    }

    const maxRangeDays = 366;
    const diffDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    if (diffDays > maxRangeDays) {
      throw new Error("Date range too large (max 366 days)");
    }

    if (employeeNumbers && employeeNumbers.length === 0) {
      return [];
    }

    const scopeKey = employeeNumbers?.length
      ? `emp:${hashEmployeeList(employeeNumbers)}`
      : "company";

    const cacheKey = `leavecal:${companyKey}:${start}:${end}:${scopeKey}`;
    const ttlSeconds = 30;


    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const rows = await this.repo.getApprovedInRange({
      companyKey,
      start,
      end,
      employeeNumbers,
    });
    if (this.cache) {
      await this.cache.set(cacheKey, JSON.stringify(rows), ttlSeconds);
    }

    return rows;
  }
  async countApprovedOnDate(params: {
  companyKey: string;
  date: string;
  employeeNumbers?: string[];
}): Promise<number> {
  const { companyKey, date, employeeNumbers } = params;

  if (!companyKey) throw new Error("companyKey is required");
  if (!date) throw new Error("date is required");

  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(date)) {
    throw new Error("Date must be YYYY-MM-DD");
  }

  if (employeeNumbers && employeeNumbers.length === 0) {
    return 0;
  }

  const scopeKey = employeeNumbers?.length
    ? `emp:${hashEmployeeList(employeeNumbers)}`
    : "company";

  const cacheKey = `leavecal:count:${companyKey}:${date}:${scopeKey}`;
  const ttlSeconds = 30;

  if (this.cache) {
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return Number(cached);
    }
  }

  const count = await this.repo.countApprovedOnDate({
    companyKey,
    date,
    employeeNumbers,
  });

  if (this.cache) {
    await this.cache.set(cacheKey, String(count), ttlSeconds);
  }

  return count;
}

}
function hashEmployeeList(employeeNumbers: string[]): string {
  const sorted = [...employeeNumbers].sort();
  let hash = 2166136261;

  for (const emp of sorted) {
    for (let i = 0; i < emp.length; i++) {
      hash ^= emp.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }

  return (hash >>> 0).toString(36);
}

