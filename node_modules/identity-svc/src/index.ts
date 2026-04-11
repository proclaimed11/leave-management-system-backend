import app from "./server";
import { bootstrapDatabase } from "./db/bootstrap";

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      console.log(`Identity Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to bootstrap identity service:", err);
    process.exit(1);
  }
}

void start();