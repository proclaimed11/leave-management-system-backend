"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEngine = void 0;
const statusRepository_1 = require("../repositories/statusRepository");
class StatusEngine {
    repo;
    constructor(repo = new statusRepository_1.StatusRepository()) {
        this.repo = repo;
    }
    async listAvailableStatuses() {
        return this.repo.listStatuses();
    }
    async findStatusByKey(statusKey) {
        return this.repo.findByKey(statusKey);
    }
}
exports.StatusEngine = StatusEngine;
