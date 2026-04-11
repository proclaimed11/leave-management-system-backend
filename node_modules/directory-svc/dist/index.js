"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_express_1 = require("@libs/common-express");
const bootstrap_1 = require("./db/bootstrap");
const employee_1 = __importDefault(require("./routes/employee"));
const internal_1 = __importDefault(require("./routes/internal"));
const departments_1 = __importDefault(require("./routes/departments"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const employeeImport_1 = __importDefault(require("./routes/employeeImport"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const maritalStatusRoutes_1 = __importDefault(require("./routes/maritalStatusRoutes"));
const genderRoutes_1 = __importDefault(require("./routes/genderRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const app = (0, common_express_1.makeApp)();
// Base routes
app.use("/employees", employee_1.default);
app.use("/internal/employees", internal_1.default);
app.use("/departments", departments_1.default);
app.use("/roles", roleRoutes_1.default);
app.use("/import", employeeImport_1.default);
app.use("/dashboard", dashboardRoutes_1.default);
app.use("/locations", locationRoutes_1.default);
app.use("/genders", genderRoutes_1.default);
app.use("/marital-statuses", maritalStatusRoutes_1.default);
app.use("/companies", companyRoutes_1.default);
app.use("/profile", profileRoutes_1.default);
// Global error handler
app.use(common_express_1.errorHandler);
const PORT = 3002;
async function start() {
    try {
        await (0, bootstrap_1.bootstrapDatabase)();
        app.listen(PORT, () => {
            console.log(`Directory Service running on port ${PORT} 🌍`);
        });
    }
    catch (err) {
        console.error("Failed to bootstrap directory service:", err);
        process.exit(1);
    }
}
void start();
