import { CompanyRepository } from "../repositories/companyRepository";
import { DashboardOverview } from "../types/dashboard";
import { Company } from "../types/types";

export class CompanyEngine {
  constructor(private repo = new CompanyRepository()) {}

  async listCompanies(): Promise<Company[]> {
    return this.repo.listActive();
  }
    async getOverview(companyKey?: string): Promise<DashboardOverview> {
      const kpis = await this.repo.getKPIs(companyKey);
      const departments = await this.repo.getDepartmentsCount(companyKey);
      const employeesByDepartment =
        await this.repo.employeesByDepartment(companyKey);
      const employeesByRole =
        await this.repo.employeesByRole(companyKey);
  
      return {
        kpis: {
          ...kpis,
          departments,
        },
        employeesByDepartment,
        employeesByRole,
      };
    }
  }
