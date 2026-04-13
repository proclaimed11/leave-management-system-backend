"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentTypeEngine = void 0;
const employmentTypeRepository_1 = require("../repositories/employmentTypeRepository");
class EmploymentTypeEngine {
    repo;
    constructor(repo = new employmentTypeRepository_1.EmploymentTypeRepository()) {
        this.repo = repo;
    }
    async listEmploymentTypes() {
        return this.repo.listAll();
    }
}
exports.EmploymentTypeEngine = EmploymentTypeEngine;
