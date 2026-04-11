import { makeApp, errorHandler } from "@libs/common-express";
import { bootstrapDatabase } from "./db/bootstrap";
import employeeRoutes from "./routes/employee";
import internalroutes from "./routes/internal"
import departmentRoutes from "./routes/departments";
import roleRoutes from "./routes/roleRoutes";
import importEmployeeRoutes from "./routes/employeeImport";
import dashboardRoutes from "./routes/dashboardRoutes";
import locationRoutes from "./routes/locationRoutes";
import maritalStatusRoutes from "./routes/maritalStatusRoutes";
import genderRoutes from "./routes/genderRoutes";
import companyRoutes from "./routes/companyRoutes";
import profileRoutes from "./routes/profileRoutes";


const app = makeApp();

// Base routes
app.use("/employees", employeeRoutes as any);
app.use("/internal/employees", internalroutes as any);
app.use("/departments", departmentRoutes as any);
app.use("/roles", roleRoutes as any);
app.use("/import", importEmployeeRoutes as any);
app.use("/dashboard", dashboardRoutes as any);
app.use("/locations", locationRoutes as any);
app.use("/genders", genderRoutes as any);
app.use("/marital-statuses", maritalStatusRoutes as any);
app.use("/companies", companyRoutes as any);
app.use("/profile", profileRoutes  as any);


// Global error handler
app.use(errorHandler);

const PORT = 3002;

async function start() {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      console.log(`Directory Service running on port ${PORT} 🌍`);
    });
  } catch (err) {
    console.error("Failed to bootstrap directory service:", err);
    process.exit(1);
  }
}

void start();
