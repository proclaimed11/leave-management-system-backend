import { makeApp, errorHandler } from "@libs/common-express";
import entitlementRoutes from "./routes/./entitlement";
import internalRoutes from "./routes/internal";


const app = makeApp();

// Base routes
app.use("/entitlement", entitlementRoutes as any);

app.use("/internal", internalRoutes as any);


// Global error handler
app.use(errorHandler);

const PORT = 3005;

app.listen(PORT, () => {
  console.log(`Directory Service running on port ${PORT} 🌍`);
});
