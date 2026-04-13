import fs from "fs";
import { RequestHandler } from "express";

import { publicAvatarPath } from "../config/uploadPaths";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { tryRemoveStoredAvatar } from "../utils/avatarFileCleanup";

const repo = new EmployeeRepository();

export const uploadEmployeeAvatar: RequestHandler = async (req, res) => {
  try {
    const { employee_number } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No image file received (use field name \"file\")" });
      return;
    }

    const existing = await repo.findByEmployeeNumber(employee_number as string);
    if (!existing) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const relativePath = publicAvatarPath(file.filename);
    tryRemoveStoredAvatar(existing.avatar_url as string | null | undefined);

    const updated = await repo.updateAvatarUrl(employee_number as string, relativePath);
    if (!updated) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
      res.status(500).json({ error: "Failed to update employee avatar" });
      return;
    }

    res.json({
      message: "Avatar updated",
      avatar_url: relativePath,
      employee: updated,
    });
  } catch (err: any) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        /* ignore */
      }
    }
    res.status(400).json({ error: err.message ?? "Upload failed" });
  }
};
