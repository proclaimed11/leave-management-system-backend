"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = void 0;
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
