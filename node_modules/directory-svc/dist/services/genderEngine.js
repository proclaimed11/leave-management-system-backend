"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenderEngine = void 0;
const genderRepository_1 = require("../repositories/genderRepository");
class GenderEngine {
    repo;
    constructor(repo = new genderRepository_1.GenderRepository()) {
        this.repo = repo;
    }
    async listGenders() {
        return this.repo.listActive();
    }
}
exports.GenderEngine = GenderEngine;
