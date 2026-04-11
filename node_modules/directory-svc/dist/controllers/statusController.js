"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusByKey = exports.listStatuses = void 0;
const statusEngine_1 = require("../services/statusEngine");
const engine = new statusEngine_1.StatusEngine();
const listStatuses = async (req, res) => {
    console.log("Listing statuses");
    try {
        const statuses = await engine.listAvailableStatuses();
        res.json(statuses);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.listStatuses = listStatuses;
const getStatusByKey = async (req, res) => {
    try {
        const statusKey = req.params.status_key;
        const status = await engine.findStatusByKey(statusKey);
        if (!status) {
            return res.status(404).json({ error: "Status not found" });
        }
        res.json(status);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getStatusByKey = getStatusByKey;
