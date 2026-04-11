"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { event_type, actor_employee_number, actor_role, target_employee_number, description, metadata } = req.body;
        if (!event_type || !description) {
            return res.status(400).json({ error: "event_type and description are required" });
        }
        const result = await connection_1.pool.query(`
      INSERT INTO audit_logs (
        event_type,
        actor_employee_number,
        actor_role,
        target_employee_number,
        description,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `, [
            event_type,
            actor_employee_number || null,
            actor_role || null,
            target_employee_number || null,
            description,
            metadata || {}
        ]);
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error("Audit log error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const event_type = req.query.event_type;
        const actor = req.query.actor;
        const target = req.query.target;
        const from = req.query.from;
        const to = req.query.to;
        let query = `
      SELECT *
      FROM audit_logs
      WHERE 1 = 1
    `;
        const params = [];
        if (event_type) {
            params.push(event_type);
            query += ` AND event_type = $${params.length}`;
        }
        if (actor) {
            params.push(actor);
            query += ` AND actor_employee_number = $${params.length}`;
        }
        if (target) {
            params.push(target);
            query += ` AND target_employee_number = $${params.length}`;
        }
        if (from) {
            params.push(from);
            query += ` AND created_at >= $${params.length}`;
        }
        if (to) {
            params.push(to);
            query += ` AND created_at <= $${params.length}`;
        }
        params.push(limit);
        params.push(offset);
        query += `
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
        const result = await connection_1.pool.query(query, params);
        return res.json({
            page,
            limit,
            count: result.rows.length,
            logs: result.rows
        });
    }
    catch (err) {
        console.error("Fetch logs error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
