import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.dirname(__filename);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Load a local .env without overriding variables supplied by the host.
function loadLocalEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[2].startsWith("#")) continue;
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadLocalEnv();

function parseBlockedDomains(value) {
  if (!value || value.trim().toLowerCase() === "null") return [];
  return [...new Set(value.split(",").map((entry) => entry.trim().toLowerCase().replace(/^\.+|\.+$/g, "")).filter(Boolean))];
}

const blockedDomains = parseBlockedDomains(process.env.PROXY_BLOCKED_DOMAINS);
const blockSubdomains = String(process.env.PROXY_BLOCK_SUBDOMAINS ?? "true").toLowerCase() !== "false";

const production = process.env.NODE_ENV === "production";
const staticOptions = {
  fallthrough: true,
  index: false,
  dotfiles: "deny",
  etag: true,
  maxAge: production ? "1h" : 0
};

for (const directory of ["assets", "xttc", "mqmy", "hrqe"]) {
  app.use(`/${directory}`, express.static(path.join(root, directory), staticOptions));
}

app.get("/healthz", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ ok: true, service: "fern-node" });
});

// Only publish the block policy, never the full process environment.
app.get("/api/proxy-policy", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ blockedDomains, blockSubdomains });
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

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (path.extname(req.path)) {
    return res.status(404).type("text/plain").send("Asset not found");
  }
  next();
});

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
