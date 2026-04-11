
import { makeApp, errorHandler } from "@libs/common-express";
import leaveRequestRoutes from "./routes/leaveRequestRoutes";
import leaveRequestHandover from "./routes/handoverRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import applyLeaveOverview from './routes/applyLeaveOverview'
import approvalRoutes from "./routes/approvalRoutes";
import internalRoutes from "./routes/internalRoutes";
import calendarRoutes from "./routes/calendarRoutes";


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

const PORT = 3006;

app.listen(PORT, () => {
  console.log(`📘 Leave Request Service running on port ${PORT}`);
});

