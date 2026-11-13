# Fern Node

A Node.js web app that serves the Fern interface and its browser assets.

## Included

- Fern web interface
- Frontend scripts, styles, fonts, and service-worker assets
- Browser game interface assets
- Express server for local development

## Getting Started

### Requirements

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/atharvchoudhari123/fern-node.git
cd fern-node
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `assets/` — Frontend scripts, styles, and fonts
- `xttc/` — Browser runtime assets
- `fern.html` — Web app entry point
- `ginakj.js` — Service worker
- `server.js` — Express server

Proxy navigation is not enabled until a destination allowlist is configured.
