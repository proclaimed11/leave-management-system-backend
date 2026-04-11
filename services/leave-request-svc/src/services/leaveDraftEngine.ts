
import { pool } from "../db/connection";
import { LeaveRepository } from "../repositories/leaveRepository";
import { CreateLeaveDraftInput } from "../types/draft";

export class LeaveDraftService {
  constructor(
    private repo = new LeaveRepository(),
  ) {}

  async createDraft(input: CreateLeaveDraftInput): Promise<{ id: number }> {
    return pool.query("BEGIN").then(async () => {
      try {
        const client = await pool.connect();
        try {
          const draft = await this.repo.createDraft(client, input);
          await client.query("COMMIT");
          return draft;
        } finally {
          client.release();
        }
      } catch (err) {
        await pool.query("ROLLBACK");
        throw err;
      }
    });
  }
}
