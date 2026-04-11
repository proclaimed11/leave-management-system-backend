"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGenders = void 0;
const genderEngine_1 = require("../services/genderEngine");
const engine = new genderEngine_1.GenderEngine();
const listGenders = async (_req, res) => {
    try {
        const genders = await engine.listGenders();
        res.json({
            count: genders.length,
            genders,
        });
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to fetch genders",
            message: err.message,
        });
    }
};
exports.listGenders = listGenders;
