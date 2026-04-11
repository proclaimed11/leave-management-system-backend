import { GenderRepository } from "../repositories/genderRepository";
import { Gender } from "../types/types";

export class GenderEngine {
  constructor(private repo = new GenderRepository()) {}

  async listGenders(): Promise<Gender[]> {
    return this.repo.listActive();
  }
}
