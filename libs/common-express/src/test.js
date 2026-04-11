"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const app = (0, index_1.makeApp)();
app.get("/", (_req, res) => {
    res.json({ message: "Hello from common-express" });
});
// test error handling
app.get("/error", (_req, _res, next) => {
    next(new index_1.HttpError(400, "Test error triggered"));
});
app.use(index_1.errorHandler);
app.listen(3001, () => {
    console.log("common-express test server running on http://localhost:3001");
});
