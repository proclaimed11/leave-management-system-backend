import { makeApp, errorHandler } from "@libs/common-express";
import authRoutes from "./routes/authRoutes";



const app = makeApp();


app.get("/", (req, res) => {
  res.json({ message: "Identity Service is running" });
});
app.use("/auth", authRoutes as any) 
app.use(errorHandler);

export default app;
