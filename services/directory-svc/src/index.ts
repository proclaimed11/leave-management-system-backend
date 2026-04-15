import "dotenv/config";
import express from "express";
import path from "path";

import { makeApp, errorHandler } from "@libs/common-express";
import { UPLOAD_ROOT, ensureAvatarDir } from "./config/uploadPaths";
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
import employmentTypeRoutes from "./routes/employmentTypeRoutes";
import countryRoutes from "./routes/countryRoutes";
import profileRoutes from "./routes/profileRoutes";
import { assertIdentityReady } from "./services/identityClient";


const app = makeApp();

ensureAvatarDir();

// Auth-scoped API responses must never be browser-cached across users.
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(
  "/uploads",
  express.static(path.resolve(UPLOAD_ROOT), {
    maxAge: process.env.NODE_ENV === "production" ? 7 * 24 * 60 * 60 * 1000 : 0,
  }) as Parameters<typeof app.use>[1]
);

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
app.use("/employment-types", employmentTypeRoutes as any);
app.use("/countries", countryRoutes as any);
app.use("/profile", profileRoutes  as any);


// Global error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3002;

async function start() {
  try {
    const requireIdentity = (process.env.REQUIRE_IDENTITY_ON_BOOT ?? "true").toLowerCase() === "true";
    if (requireIdentity) {
      await assertIdentityReady();
      console.log("Identity dependency check passed");
    }
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
