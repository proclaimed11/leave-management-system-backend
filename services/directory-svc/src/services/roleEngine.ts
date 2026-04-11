import { RoleRepository } from "../repositories/roleReposirory";
import { DirectoryRole, DirectoryRoleKey, ListEmployeesByRoleInput } from "../types/types";
import { RoleAssignmentValidator } from "../validators/roleValidator";

export class RoleEngine {
  
  constructor(
    private repo = new RoleRepository(),
    private validator = new RoleAssignmentValidator()
  ) {}

  async listAvailableRoles(): Promise<DirectoryRole[]> {
    return this.repo.listRoles();
  }
  async assignRole(
    employeeNumber: string,
    roleKey: DirectoryRoleKey,
    actorEmployeeNumber: string
  ) {
    await this.validator.validateAssignRole({
      targetEmployeeNumber: employeeNumber,
      newRole: roleKey,
      actorEmployeeNumber,
    });

    return this.repo.updateRole(employeeNumber, roleKey);
  }

async listEmployeesByRole(input: ListEmployeesByRoleInput) {

  const role = await this.repo.findByKey(input.roleKey);
  if (!role) throw new Error("Invalid role");

  const { total, employees } = await this.repo.listByRole(input);

  const totalPages = Math.max(1, Math.ceil(total / input.limit));

  return {
    page: input.page,
    limit: input.limit,
    count: employees.length,
    total,
    total_pages: totalPages,
    employees,
  };
}

  async listHodCandidates(department: string) {
    if (!department) {
      throw new Error("Department is required");
    }

    return this.repo.listHodCandidatesByDepartment(department);
  }
  async listSupervisorCandidates(department: string) {
    if (!department) {
      throw new Error("Department is required");
    }

    return this.repo.listSupervisorCandidatesByDepartment(department);
  }
}