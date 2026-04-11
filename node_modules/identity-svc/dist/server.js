"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_express_1 = require("@libs/common-express");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, common_express_1.makeApp)();
app.get("/", (req, res) => {
    res.json({ message: "Identity Service is running" });
});
app.use("/auth", authRoutes_1.default);
app.use(common_express_1.errorHandler);
exports.default = app;
