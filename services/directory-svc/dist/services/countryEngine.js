"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryEngine = void 0;
const countryRepository_1 = require("../repositories/countryRepository");
class CountryEngine {
    repo;
    constructor(repo = new countryRepository_1.CountryRepository()) {
        this.repo = repo;
    }
    async listCountries() {
        return this.repo.listAll();
    }
}
exports.CountryEngine = CountryEngine;
