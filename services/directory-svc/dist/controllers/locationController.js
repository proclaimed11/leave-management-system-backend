"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLocations = void 0;
const locationEngine_1 = require("../services/locationEngine");
const engine = new locationEngine_1.LocationEngine();
const listLocations = async (_req, res) => {
    try {
        const locations = await engine.listLocations();
        res.json({
            count: locations.length,
            locations,
        });
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to fetch locations",
            message: err.message,
        });
    }
};
exports.listLocations = listLocations;
