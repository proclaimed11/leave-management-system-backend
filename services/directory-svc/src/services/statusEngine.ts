import { StatusRepository } from "../repositories/statusRepository";
import { DirectoryStatus } from "../types/types";

export class StatusEngine {
  constructor(private repo = new StatusRepository()) {}

  async listAvailableStatuses(): Promise<DirectoryStatus[]> {
    return this.repo.listStatuses();
  }

  async findStatusByKey(statusKey: string): Promise<DirectoryStatus | null> {
    return this.repo.findByKey(statusKey);
  }
}   