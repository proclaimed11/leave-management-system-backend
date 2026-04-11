"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaritalStatusEngine = void 0;
const maritalStatusRepository_1 = require("../repositories/maritalStatusRepository");
class MaritalStatusEngine {
    repo;
    constructor(repo = new maritalStatusRepository_1.MaritalStatusRepository()) {
        this.repo = repo;
    }
    async listMaritalStatuses() {
        return this.repo.listActive();
    }
}
exports.MaritalStatusEngine = MaritalStatusEngine;
