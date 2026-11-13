# Fern Node

A Node.js-hosted frontend shell for the Fern project.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm run check
npm start
```

Open http://localhost:3000.

## Deployment

### Standard Node host

Deploy this repository to a host that runs a persistent Node.js process (for example, a Node service on Render, Railway, or your own server).

- Build/install command: `npm install`
- Start command: `npm start`
- Health check: `/healthz`
- Set `NODE_ENV=production`

The server binds to `0.0.0.0` and uses the host-provided `PORT`.

### Vercel

The included `vercel.json` routes requests through the Express handler in `api/index.js`. This is suitable for serving the frontend and static files. Vercel Functions are not a persistent WebSocket host; any separate realtime transport must run on a host that supports long-lived WebSocket connections.

## Static asset behavior

Only the expected public asset directories are served. Missing JavaScript, module, worker, CSS, and WASM files return HTTP 404 instead of the HTML application shell. This makes missing runtime files easier to diagnose and prevents browser errors caused by parsing HTML as JavaScript.

## Proxy/runtime status

The current repository still needs the matching Scramjet worker and transport module before the browser runtime can initialize. The Fern network capture supplied for inspection did not include those files. Do not mix Scramjet/Bare-Mux generations or copy a worker from a different version.

Proxy destinations should be restricted to domains you own or are authorized to test. This repository does not claim to provide unrestricted access to arbitrary websites.

## Ads

The Node host does not inject advertising scripts. This does not remove advertisements served by third-party websites that are opened inside an embedded browser.
