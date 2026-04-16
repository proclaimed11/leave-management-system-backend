import "dotenv/config";
import { makeApp, errorHandler } from "@libs/common-express";
import entitlementRoutes from "./routes/./entitlement";
import internalRoutes from "./routes/internal";
import { runMigration } from "./db/runMigration";


const app = makeApp();

// Base routes
app.use("/entitlement", entitlementRoutes as any);

app.use("/internal", internalRoutes as any);


// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3005;

async function start() {
  try {
    const autoMigrate = (process.env.AUTO_RUN_MIGRATIONS ?? "true").toLowerCase() === "true";
    if (autoMigrate) {
      await runMigration(false);
      console.log("Entitlement migrations checked on startup");
    }

    const server = app.listen(PORT, () => {
      console.log(`Entitlement Service running on port ${PORT} 🌍`);
    });
    server.on("error", (err) => {
      console.error("Entitlement service listen error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to bootstrap entitlement service:", err);
    process.exit(1);
  }
}

void start();
