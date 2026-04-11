import { ProfileRepository } from "../repositories/profileRepository";
import { UpdateMyProfileDTO } from "../types/profile";

export class ProfileEngine {
  private repo: ProfileRepository;

  constructor(repo = new ProfileRepository()) {
    this.repo = repo;
  }

  async getMyProfile(employeeNumber: string) {
    const profile = await this.repo.getByEmployeeNumber(employeeNumber);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  }

  async updateMyProfile(employeeNumber: string, data: UpdateMyProfileDTO) {
    return this.repo.updateSelfProfile(employeeNumber, data);
  }
}
