import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.get("/healthz", (_req, res) => res.json({ ok: true, service: "fern-node" }));

app.use(express.static(__dirname, {
  index: false,
  fallthrough: true,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.get("/gqqn/{*splat}", (_req, res) => res.sendFile(path.join(__dirname, "fern.html")));
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(__dirname, "fern.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Fern Node listening on http://localhost:${PORT}`);
});
