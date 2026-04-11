// src/services/managerEngine.ts

import { ManagerRepository } from "../repositories/managerRepository";

export class ManagerEngine {
  constructor(private repo = new ManagerRepository()) {}

  async getSubordinates(managerId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const subs = await this.repo.getSubordinates(managerId, limit, offset);
    const count = await this.repo.getSubordinatesCount(managerId);

    return {
      manager: managerId,
      page,
      limit,
      count,
      subordinates: subs
    };
  }

  async getReportingChain(empNo: string) {
    const chain: any[] = [];
    let current = empNo;

    while (true) {
      const emp = await this.repo.getEmployeeForChain(current);
      if (!emp) break;

      const manager = emp.manager_employee_number;
      if (!manager) break;

      const mgr = await this.repo.getEmployeeForChain(manager);
      if (!mgr) break;

      chain.push({
        employee_number: mgr.employee_number,
        full_name: mgr.full_name
      });

      current = mgr.employee_number;

      // end at top
      if (!mgr.manager_employee_number) break;
    }

    return { employee: empNo, chain };
  }
}
