import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.dirname(__filename);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const production = process.env.NODE_ENV === "production";
const staticOptions = {
  fallthrough: true,
  index: false,
  dotfiles: "deny",
  etag: true,
  maxAge: production ? "1h" : 0
};

// Serve only the asset directories the browser app needs. Do not expose the
// repository root (package.json, source files, or deployment configuration).
for (const directory of ["assets", "xttc", "mqmy", "hrqe"]) {
  app.use(`/${directory}`, express.static(path.join(root, directory), staticOptions));
}

app.get("/healthz", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ ok: true, service: "fern-node" });
});

app.get("/manifest.webmanifest", (_req, res) => {
  res.type("application/manifest+json");
  res.sendFile(path.join(root, "manifest.webmanifest"));
});

app.get("/ginakj.js", (_req, res) => {
  res.set({
    "Content-Type": "text/javascript; charset=utf-8",
    "Service-Worker-Allowed": "/",
    "Cache-Control": "no-cache"
  });
  res.sendFile(path.join(root, "ginakj.js"));
});

// Missing script/worker/WASM requests must be real 404s, never the HTML app
// shell. Returning HTML here causes browser errors such as "Unexpected token <".
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (path.extname(req.path)) {
    return res.status(404).type("text/plain").send("Asset not found");
  }
  next();
});

// Client-side application routes.
app.get("/", (_req, res) => res.sendFile(path.join(root, "fern.html")));
app.get("/{*splat}", (req, res, next) => {
  const accept = req.get("accept") || "";
  if (!accept.includes("text/html")) return next();
  if (req.path.startsWith("/gqqn/")) {
    return res.status(404).type("text/plain").send("Proxy route is not configured");
  }
  res.sendFile(path.join(root, "fern.html"));
});

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

export default app;
