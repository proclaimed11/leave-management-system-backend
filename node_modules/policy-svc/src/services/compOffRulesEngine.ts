import { CompoOffRepository } from "../repositories/compOffRepository";

export class CompOffRulesEngine {
  constructor(private repo = new CompoOffRepository()) {}

  async getRules() {
    return this.repo.getRules();
  }

  async createRules(data: any) {
    const existing = await this.repo.getRules();
    if (existing) {
      throw new Error("Comp-off rules already exist");
    }

    return this.repo.createRules(data);
  }

  async updateRules(data: any) {
    const existing = await this.repo.getRules();
    if (!existing) {
      throw new Error("Comp-off rules not found");
    }
    return this.repo.updateRules(existing.id, data);
  }
}
