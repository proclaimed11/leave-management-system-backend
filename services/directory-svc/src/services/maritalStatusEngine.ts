import { MaritalStatusRepository } from "../repositories/maritalStatusRepository";
import { MaritalStatus } from "../types/types";

export class MaritalStatusEngine {
  constructor(private repo = new MaritalStatusRepository()) {}

  async listMaritalStatuses(): Promise<MaritalStatus[]> {
    return this.repo.listActive();
  }
}
