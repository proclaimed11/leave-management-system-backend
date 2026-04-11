import { makeApp, errorHandler } from "@libs/common-express";
import policyRoutes from "./routes/policyRoutes";
import internalPolicyRoutes from './routes/internal'
import compoOffRoutes from "./routes/compoOffRoutes";
import holidayRoutes from "./routes/holidayRoutes"

const app = makeApp();

// Base routes
app.use("/leave", policyRoutes as any);
app.use("/comp_off", compoOffRoutes as any);
app.use("/internal/leave", internalPolicyRoutes as any);
app.use("/holidays", holidayRoutes as any )


// Global error handler
app.use(errorHandler);

const PORT = 3004;

app.listen(PORT, () => {
  console.log(`Directory Service running on port ${PORT} 🌍`);
});
