import { Request, Response } from "express";
import { pool } from "../db/connection";


export const getAllPolicies = async (req: Request, res: Response) => {
  console.log("here 1")
  try {
    const query = `
      SELECT 
        lt.type_key,
        lt.name,
        lt.description,
        lr.entitlement_days,
        lr.max_consecutive_days,
        lr.max_per_year,
        lr.requires_approval,
        lr.approval_levels,
        lr.paid,
        lr.deduct_from_balance,
        lr.requires_document,
        lr.attachment_required_after_days,
        lr.allow_weekends,
        lr.allow_public_holidays,
        lr.min_service_months,
        lr.gender_restriction,
        lr.notice_days_required
      FROM leave_types lt
      LEFT JOIN leave_rules lr ON lr.leave_type_id = lt.id
      ORDER BY lt.type_key ASC
    `;

    const result = await pool.query(query);

    return res.json({
      count: result.rows.length,
      policies: result.rows,
    });
  } catch (err) {
    console.error("Error fetching policies", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPolicyByType = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();

    const query = `
      SELECT 
        lt.type_key,
        lt.name,
        lt.description,
        lr.*
      FROM leave_types lt
      LEFT JOIN leave_rules lr ON lr.leave_type_id = lt.id
      WHERE lt.type_key = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [typeKey]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave type not found 2" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching single policy", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { type_key, name, description } = req.body;

    // Basic validation
    if (!type_key || !name) {
      return res.status(400).json({ error: "type_key and name are required" });
    }

    const normalizedKey = type_key.toUpperCase();

    // Check if leave type exists
    const exists = await pool.query(
      `SELECT id FROM leave_types WHERE type_key = $1`,
      [normalizedKey]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Leave type already exists" });
    }
    const result = await pool.query(
      `
      INSERT INTO leave_types (type_key, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, type_key, name, description
    `,
      [normalizedKey, name, description]
    );

    return res.status(201).json({
      message: "Leave type created successfully",
      leave_type: result.rows[0],
    });
  } catch (err) {
    console.error("Create leave type error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createLeaveRules = async (req: Request, res: Response) => {
  try {
    const {
      type_key,
      entitlement_days,
      max_consecutive_days,
      max_per_year,
      requires_approval,
      approval_levels,
      paid,
      deduct_from_balance,
      requires_document,
      attachment_required_after_days,
      allow_weekends,
      allow_public_holidays,
      min_service_months,
      gender_restriction,
      notice_days_required
    } = req.body;

    if (!type_key) {
      return res.status(400).json({ error: "type_key is required" });
    }

    const normalizedKey = type_key.toUpperCase();

    // 1️⃣ Check if leave type exists
    const typeResult = await pool.query(
      `SELECT id FROM leave_types WHERE type_key = $1`,
      [normalizedKey]
    );

    if (typeResult.rows.length === 0) {
      return res.status(400).json({ error: "Leave type not found" });
    }

    const leaveTypeId = typeResult.rows[0].id;

    // 2️⃣ Check if rules already exist
    const ruleExists = await pool.query(
      `SELECT id FROM leave_rules WHERE leave_type_id = $1`,
      [leaveTypeId]
    );

    if (ruleExists.rows.length > 0) {
      return res.status(400).json({ error: "Rules already exist for this leave type" });
    }

    // 3️⃣ Insert new leave rules
    const result = await pool.query(
      `
      INSERT INTO leave_rules (
        leave_type_id,
        entitlement_days,
        max_consecutive_days,
        max_per_year,
        requires_approval,
        approval_levels,
        paid,
        deduct_from_balance,
        requires_document,
        attachment_required_after_days,
        allow_weekends,
        allow_public_holidays,
        min_service_months,
        gender_restriction,
        notice_days_required
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15
      )
      RETURNING *
      `,
      [
        leaveTypeId,
        entitlement_days,
        max_consecutive_days,
        max_per_year,
        requires_approval,
        approval_levels,
        paid,
        deduct_from_balance,
        requires_document,
        attachment_required_after_days,
        allow_weekends,
        allow_public_holidays,
        min_service_months,
        gender_restriction,
        notice_days_required
      ]
    );

    return res.status(201).json({
      message: "Leave rules created successfully",
      rules: result.rows[0]
    });

  } catch (err) {
    console.error("Create leave rules error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const updateLeaveRules = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();
    const updates = req.body;

    const typeResult = await pool.query(
      `SELECT id FROM leave_types WHERE type_key = $1`,
      [typeKey]
    );

    if (typeResult.rows.length === 0) {
      return res.status(404).json({ error: "Leave type not found 3" });
    }

    const leaveTypeId = typeResult.rows[0].id;

    // Build dynamic SQL
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const setClauses = fields.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(updates);

    const query = `
      UPDATE leave_rules
      SET ${setClauses.join(", ")}
      WHERE leave_type_id = $${fields.length + 1}
      RETURNING *
    `;

    values.push(leaveTypeId);

    const result = await pool.query(query, values);

    return res.json({
      message: "Leave rules updated successfully",
      rules: result.rows[0],
    });
  } catch (err) {
    console.error("Update leave rules error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const disableLeaveType = async (req: Request, res: Response) => {
  try {
    const typeKey = req.params.type_key.toUpperCase();

    const result = await pool.query(
      `
      UPDATE leave_types
      SET is_active = false
      WHERE type_key = $1
      RETURNING type_key, name, is_active
      `,
      [typeKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave type not found 4" });
    }

    return res.json({
      message: "Leave type disabled",
      leave_type: result.rows[0],
    });
  } catch (err) {
    console.error("Disable leave type error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLeaveTypes = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        type_key, 
        name, 
        description,
        default_days
      FROM leave_types
      ORDER BY type_key ASC
    `);

    return res.json({
      count: result.rows.length,
      leave_types: result.rows,
    });
  } catch (err) {
    console.error("Get leave types error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
//hr
export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const type_key = req.params.type_key;
    const { name, description, default_days } = req.body;

    const result = await pool.query(
      `
      UPDATE leave_types
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        default_days = COALESCE($3, default_days)
      WHERE type_key = $4
      RETURNING id, type_key, name, description, default_days
      `,
      [name, description, default_days, type_key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    return res.json({
      message: "Leave type updated successfully",
      leave_type: result.rows[0],
    });
  } catch (err) {
    console.error("Update leave type error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


//admin/hr
export const getFullPolicy = async (req: Request, res: Response) => {
  try {
    const leaveTypes = await pool.query("SELECT * FROM leave_types ORDER BY type_key ASC");

    const leaveRules = await pool.query(`
      SELECT lt.type_key, lr.*
      FROM leave_rules lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      ORDER BY lt.type_key ASC
    `);

    const compOff = await pool.query("SELECT * FROM comp_off_rules LIMIT 1");

    return res.json({
      leave_types: leaveTypes.rows,
      leave_rules: leaveRules.rows,
      comp_off_rules: compOff.rows[0] || null,
    });
  } catch (err) {
    console.error("Full policy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
