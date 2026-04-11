import { makeApp, errorHandler, HttpError } from "./index";

const app = makeApp();

app.get("/", (_req, res) => {
  res.json({ message: "Hello from common-express" });
});

// test error handling
app.get("/error", (_req, _res, next) => {
  next(new HttpError(400, "Test error triggered"));
});

app.use(errorHandler);

app.listen(3001, () => {
  console.log("common-express test server running on http://localhost:3001");
});
