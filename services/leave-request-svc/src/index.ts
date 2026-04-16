import "dotenv/config";
import { makeApp, errorHandler } from "@libs/common-express";
import leaveRequestRoutes from "./routes/leaveRequestRoutes";
import leaveRequestHandover from "./routes/handoverRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import applyLeaveOverview from './routes/applyLeaveOverview'
import approvalRoutes from "./routes/approvalRoutes";
import internalRoutes from "./routes/internalRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import { runMigration } from "./db/runMigration";


const app = makeApp();

// Base routes
app.use("/leave-request", leaveRequestRoutes as any);
app.use("/dashboard", dashboardRoutes as any);
app.use("/leave-request-handover", leaveRequestHandover as any);
app.use("/overview", applyLeaveOverview as any)
app.use("/approvals", approvalRoutes as any);
app.use("/internal", internalRoutes as any);
app.use("/calendar", calendarRoutes as any);


// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3006;

async function start() {
  try {
    const autoMigrate = (process.env.AUTO_RUN_MIGRATIONS ?? "true").toLowerCase() === "true";
    if (autoMigrate) {
      await runMigration(false);
      console.log("Leave-request migrations checked on startup");
    }

    const server = app.listen(PORT, () => {
      console.log(`📘 Leave Request Service running on port ${PORT}`);
    });
    server.on("error", (err) => {
      console.error("Leave-request service listen error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to bootstrap leave-request service:", err);
    process.exit(1);
  }
}

void start();

