import { EmploymentTypeRepository } from "../repositories/employmentTypeRepository";
import type { EmploymentType } from "../types/types";

export class EmploymentTypeEngine {
  constructor(private repo = new EmploymentTypeRepository()) {}

  async listEmploymentTypes(): Promise<EmploymentType[]> {
    return this.repo.listAll();
  }
}
