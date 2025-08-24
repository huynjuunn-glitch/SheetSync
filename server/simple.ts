import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from client/dist
app.use(express.static(path.join(process.cwd(), "client/dist")));

// Serve index.html for all routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client/dist/index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  console.log(`Serving client from: ${path.join(process.cwd(), "client/dist")}`);
});