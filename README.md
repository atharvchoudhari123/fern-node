# Fern Node

Node.js wrapper for the Fern frontend and its browser-side proxy service worker.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000.

The original `Sites/fern` folder is left unchanged. Generated dependencies (`node_modules`) are intentionally not committed; install them from the lockfile. Only use proxy routing for destinations you own or are authorized to access. The proxy does not override network, school, workplace, parental, or site access controls.

## Debugging

The service worker had a duplicate `const swBase` declaration, which prevented it from parsing. That declaration is corrected in this repository. See `docs/DEBUGGING.md` for the remaining verification checklist.
