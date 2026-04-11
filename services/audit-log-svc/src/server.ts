import "dotenv/config";
import { makeApp } from "@libs/common-express";
import auditRoutes from "./routes/audit";
import { bootstrapDatabase } from "./db/bootstrap";

const app = makeApp();

app.use("/audit", auditRoutes as any);

const PORT = process.env.PORT || 3003;

async function start() {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      console.log(`📜 Audit Log Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to bootstrap audit-log service:", err);
    process.exit(1);
  }
}

void start();
