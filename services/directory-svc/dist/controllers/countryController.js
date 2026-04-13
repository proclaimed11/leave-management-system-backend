"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCountries = void 0;
const countryEngine_1 = require("../services/countryEngine");
const engine = new countryEngine_1.CountryEngine();
const listCountries = async (_req, res) => {
    try {
        const countries = await engine.listCountries();
        res.json(countries);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listCountries = listCountries;
