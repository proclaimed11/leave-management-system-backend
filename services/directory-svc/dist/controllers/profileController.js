"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getMyProfile = void 0;
const profileEngine_1 = require("../services/profileEngine");
const engine = new profileEngine_1.ProfileEngine();
const getMyProfile = async (req, res) => {
    try {
        const me = req.user;
        const employeeNumber = me.employee_number;
        const profile = await engine.getMyProfile(employeeNumber);
        return res.json(profile);
    }
    catch (err) {
        return res.status(404).json({ error: err.message });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    try {
        const me = req.user;
        const employeeNumber = me.employee_number;
        const updated = await engine.updateMyProfile(employeeNumber, req.body);
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.updateMyProfile = updateMyProfile;
