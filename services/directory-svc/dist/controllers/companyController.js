"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyOverview = exports.listCompanies = void 0;
const companyEngine_1 = require("../services/companyEngine");
const engine = new companyEngine_1.CompanyEngine();
const listCompanies = async (_req, res) => {
    try {
        const companies = await engine.listCompanies();
        res.json({
            count: companies.length,
            companies,
        });
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to fetch companies",
            message: err.message,
        });
    }
};
exports.listCompanies = listCompanies;
const getCompanyOverview = async (req, res) => {
    try {
        const companyKey = req.query.company_key;
        if (!companyKey) {
            return res.status(400).json({
                error: "company_key query parameter is required",
            });
        }
        const data = await engine.getOverview(companyKey);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCompanyOverview = getCompanyOverview;
