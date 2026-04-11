"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_express_1 = require("@libs/common-express");
const CalendarRoutes_1 = __importDefault(require("./routes/./CalendarRoutes"));
const app = (0, common_express_1.makeApp)();
app.use("/calendar", CalendarRoutes_1.default);
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`📜 Audit Log Service running on port ${PORT}`);
});
