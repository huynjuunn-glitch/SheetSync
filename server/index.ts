import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("client/dist"));

async function startServer() {
  try {
    await registerRoutes(app);
    
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();