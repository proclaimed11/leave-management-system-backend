"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMaritalStatuses = void 0;
const maritalStatusEngine_1 = require("../services/maritalStatusEngine");
const engine = new maritalStatusEngine_1.MaritalStatusEngine();
const listMaritalStatuses = async (_req, res) => {
    try {
        const statuses = await engine.listMaritalStatuses();
        res.json({
            count: statuses.length,
            marital_statuses: statuses,
        });
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to fetch marital statuses",
            message: err.message,
        });
    }
};
exports.listMaritalStatuses = listMaritalStatuses;
