import { DashboardRepository } from "../repositories/dashboardRepository";
import { CountryDashboardOverview, DashboardOverview } from "../types/dashboard";

export class DashboardEngine {
  constructor(private repo = new DashboardRepository()) {}

  async getOverview(): Promise<DashboardOverview> {
    const kpis = await this.repo.getKPIs();
    const departments = await this.repo.getDepartmentsCount();
    const employeesByDepartment = await this.repo.employeesByDepartment();
    const employeesByRole = await this.repo.employeesByRole();

    return {
      kpis: {
        ...kpis,
        departments,
      },
      employeesByDepartment,
      employeesByRole,
    };
  }

  async getCountryOverview(countryPrefix: string): Promise<CountryDashboardOverview> {
    if (!countryPrefix?.trim()) {
      throw new Error("country_prefix is required");
    }
    return this.repo.getCountryOverview(countryPrefix);
  }
}
