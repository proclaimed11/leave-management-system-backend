import { RequestHandler } from "express";
import { StatusEngine } from "../services/statusEngine";

const engine = new StatusEngine();

export const listStatuses: RequestHandler = async (req, res) => {
    console.log("Listing statuses");
  try {
    const statuses = await engine.listAvailableStatuses();
    res.json(statuses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const getStatusByKey: RequestHandler = async (req, res) => {
  try {
    const statusKey = req.params.status_key;
    const status = await engine.findStatusByKey(statusKey as string);
    if (!status) {
      return res.status(404).json({ error: "Status not found" });
    }
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};