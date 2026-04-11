"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileEngine = void 0;
const profileRepository_1 = require("../repositories/profileRepository");
class ProfileEngine {
    repo;
    constructor(repo = new profileRepository_1.ProfileRepository()) {
        this.repo = repo;
    }
    async getMyProfile(employeeNumber) {
        const profile = await this.repo.getByEmployeeNumber(employeeNumber);
        if (!profile) {
            throw new Error("Profile not found");
        }
        return profile;
    }
    async updateMyProfile(employeeNumber, data) {
        return this.repo.updateSelfProfile(employeeNumber, data);
    }
}
exports.ProfileEngine = ProfileEngine;
