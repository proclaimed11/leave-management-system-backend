import { makeApp } from "@libs/common-express";
import calenderRputes from "./routes/./CalendarRoutes";

const app = makeApp();

app.use("/calendar", calenderRputes as any);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`📜 Audit Log Service running on port ${PORT}`);
});
