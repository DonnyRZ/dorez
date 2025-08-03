# Gemini-CLI Electron Template Rulebook  
*(Last updated 2025-08-03)*

---

## 1  Backend & Database — Node-only, scalable  

1. **Single runtime.** Keep all server logic in Node 20+; do **not** add Python or other runtimes. Node’s non-blocking I/O lets a single process handle thousands of concurrent DB calls efficiently :contentReference[oaicite:0]{index=0}.  
2. **DB access via drivers.** Add databases through mature npm drivers (`pg`, `sqlite3`, etc.); no extra runtimes required :contentReference[oaicite:1]{index=1}.  
3. **Off-load CPU-bound work.** Use `worker_threads` or `child_process.spawn` for heavy tasks while the event loop stays responsive :contentReference[oaicite:2]{index=2}.

---

## 2  Single-Page Application — one HTML file, many views  

* **Exactly one `index.html`.** The SPA loads once; dynamic routing or tabs render unlimited screens with no full-page reloads.  
* **Bundle via Electron Forge Webpack / Vite.** The build picks up JS modules and styles automatically, mirroring Forge’s official templates :contentReference[oaicite:3]{index=3}.  

---

## 3  File-Layout Invariants  

| **Fixed — do not rename** | **Free to reorganise** |
|---------------------------|------------------------|
| `src/main/main.js` (entry) | Any feature modules under `src/` |
| `src/main/preload.js`      | Images, fonts, extra CSS |
| `src/renderer/index.html`  | New UI components or routes |

Renaming the Electron entry file or changing `package.json.main` breaks Forge packaging with *“packageJSON.main must be set to a valid entry point”* :contentReference[oaicite:4]{index=4}.

---

## 4  Security Hardening  

1. **Enable `contextIsolation: true` and `nodeIntegration: false`** on every `BrowserWindow` to prevent privileged API exposure :contentReference[oaicite:5]{index=5}.  
2. **Set a strict Content-Security-Policy** (`default-src 'self'`) in `index.html` to block remote code injection :contentReference[oaicite:6]{index=6}.  
3. **Flip Electron Fuses at package-time** to disable the `remote` module and strip junk :contentReference[oaicite:7]{index=7}.  
4. **Use isolated IPC.** Expose only whitelisted functions through `contextBridge`; validate all inputs :contentReference[oaicite:8]{index=8}.  

---

## 5  Reproducible Dependencies  

* **Commit `package-lock.json`.** Lockfiles guarantee byte-for-byte identical installs across machines and CI runners :contentReference[oaicite:9]{index=9}.  
* Regenerate the lock only when intentionally updating dependencies (e.g. `npm audit fix`).  

---

## 6  Code-Quality Automation  

* **ESLint + Prettier (flat config).** Lint errors fail CI; Prettier keeps formatting consistent :contentReference[oaicite:10]{index=10}.  
* **Husky + lint-staged.** Pre-commit hook auto-fixes staged files to maintain style hygiene :contentReference[oaicite:11]{index=11}.  

---

## 7  CI / Release Workflow (GitHub Actions)  

1. **Matrix build** on Ubuntu, Windows, and macOS runners.  
2. Steps: `npm ci` → lint/tests → `electron-forge make`.  
3. **Publish** artifacts to a drafted GitHub Release via Forge’s GitHub publisher or the Tauri Action pattern :contentReference[oaicite:12]{index=12}.  
4. Tag releases semver (`v1.2.3`); auto-update integration is optional once signing is set up.

---

## 8  Documentation & Enforcement  

* **This file (`GEMINI.md`)** lives in the repo root so the Gemini agent always references the latest rules.  
* **README.md** mirrors these rules in human-friendly prose.  
* **SECURITY.md** lists all Electron security switches and why they’re mandatory.  

---

## 9  Demo App — Instant README Generator  

1. **Drag-and-drop local codebase folder** into the window (Electron’s native DnD API :contentReference[oaicite:13]{index=13}).  
2. Main process scans directory (size-guard ≤ 200 files), spawns `npx gemini run readme-prompt.yaml …`.  
3. Streamed Markdown appears line-by-line; file saved as `README.md`.  
4. All processing is offline via Gemini CLI .

---

### Final Checklist  

* Node.js is the **only** runtime; DB access via Node drivers.  
* **One** HTML file; SPA routing handles views.  
* Security flags locked; Forge Fuses strip unused internals.  
* Lockfile committed; ESLint/Prettier + Husky enforce style.  
* GitHub Actions build & release on all OSes with reproducible installers.