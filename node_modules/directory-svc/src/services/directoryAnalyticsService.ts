import { DirectoryAnalyticsRepository } from "../repositories/directoryAnalyticsRepository";
import {
  DepartmentSummaryRow,
  EmployeeBasic,
} from "../types/directoryAnalytics";

export class DirectoryAnalyticsService {
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private repo: DirectoryAnalyticsRepository) {}

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any, ttlMs: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  async getDepartmentSummary(): Promise<DepartmentSummaryRow[]> {
    const cacheKey = "department_summary_ke";

    const cached = this.getFromCache<DepartmentSummaryRow[]>(cacheKey);
    if (cached) return cached;

    const data = await this.repo.getDepartmentSummary();

    this.setCache(cacheKey, data, 5 * 60_000);

    return data;
  }
  async getEmployeesByNumbers(employeeNumbers: string[]): Promise<EmployeeBasic[]> {
    const cacheKey = `employees_by_numbers_${employeeNumbers.sort().join(",")}`;

    const cached = this.getFromCache<EmployeeBasic[]>(cacheKey);
    if (cached) return cached;

    const data = await this.repo.getEmployeesByNumbers(employeeNumbers);

    this.setCache(cacheKey, data, 10 * 60_000);

    return data;
  }
}
