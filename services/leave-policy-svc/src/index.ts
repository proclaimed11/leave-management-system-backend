import "dotenv/config";
import { makeApp, errorHandler } from "@libs/common-express";
import policyRoutes from "./routes/policyRoutes";
import internalPolicyRoutes from './routes/internal'
import compoOffRoutes from "./routes/compoOffRoutes";
import holidayRoutes from "./routes/holidayRoutes"
import { runMigration } from "./db/runMigration";

const app = makeApp();

// Base routes
app.use("/leave", policyRoutes as any);
app.use("/comp_off", compoOffRoutes as any);
app.use("/internal/leave", internalPolicyRoutes as any);
app.use("/holidays", holidayRoutes as any )


// Global error handler
app.use(errorHandler);

const PORT = 3004;

async function start() {
  try {
    const autoMigrate = (process.env.AUTO_RUN_MIGRATIONS ?? "true").toLowerCase() === "true";
    if (autoMigrate) {
      await runMigration(false);
      console.log("Policy migrations checked on startup");
    }

    const server = app.listen(PORT, () => {
      console.log(`Leave Policy Service running on port ${PORT} 🌍`);
    });
    server.on("error", (err) => {
      console.error("Leave policy service listen error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to bootstrap policy service:", err);
    process.exit(1);
  }
}

void start();
