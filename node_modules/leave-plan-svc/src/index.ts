
import { makeApp, errorHandler } from "@libs/common-express";
import leavePlanRoutes from "./routes/leavePlanRoutes";

const app = makeApp();
app.use("/leave-plan", leavePlanRoutes as any);

// Global error handler
app.use(errorHandler);

const PORT = 3007;

app.listen(PORT, () => {
  console.log(`📘 Leave Request Service running on port ${PORT}`);
});

