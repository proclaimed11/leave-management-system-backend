"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryDashboardOverview = exports.getDashboardOverview = void 0;
const dashboardEngine_1 = require("../services/dashboardEngine");
const engine = new dashboardEngine_1.DashboardEngine();
const getDashboardOverview = async (req, res) => {
    try {
        const data = await engine.getOverview();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDashboardOverview = getDashboardOverview;
const getCountryDashboardOverview = async (req, res) => {
    try {
        const requested = String(req.query.country_prefix ?? "").trim().toUpperCase();
        const scope = req.employee_visibility_scope;
        if (!scope || scope.mode === "none") {
            return res.status(403).json({ error: "Forbidden" });
        }
        let effectiveCountry = requested;
        if (scope.mode === "location" || scope.mode === "location_department") {
            effectiveCountry = scope.location_prefix;
            if (requested && requested !== scope.location_prefix) {
                return res.status(403).json({ error: "Forbidden: cross-country access denied" });
            }
        }
        if (!effectiveCountry) {
            return res.status(422).json({ error: "country_prefix is required" });
        }
        const data = await engine.getCountryOverview(effectiveCountry);
        return res.json(data);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getCountryDashboardOverview = getCountryDashboardOverview;
