"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationEngine = void 0;
const locationRepository_1 = require("../repositories/locationRepository");
class LocationEngine {
    repo;
    constructor(repo = new locationRepository_1.LocationRepository()) {
        this.repo = repo;
    }
    async listLocations() {
        return this.repo.listActive();
    }
}
exports.LocationEngine = LocationEngine;
