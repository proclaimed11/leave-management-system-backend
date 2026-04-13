"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmploymentTypes = void 0;
const employmentTypeEngine_1 = require("../services/employmentTypeEngine");
const engine = new employmentTypeEngine_1.EmploymentTypeEngine();
const listEmploymentTypes = async (_req, res) => {
    try {
        const types = await engine.listEmploymentTypes();
        res.json(types);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listEmploymentTypes = listEmploymentTypes;
