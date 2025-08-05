# Gemini-CLI Electron Template

A minimal, beginner-friendly scaffold that shows how to wire **Electron + Gemini CLI** together.

---

## Why this template?

This template is designed for developers who want to build desktop AI applications using Electron and the Gemini CLI without getting bogged down in complex setup or environment issues. It provides a robust, pre-configured foundation, allowing you to focus on your application's unique features.

**Key Principles:**

- **"Black Box" Core:** The template's core logic is stable and should generally **not be modified**. This prevents accidental breakage of the complex Electron-Gemini CLI integration.
- **Clear Separation of Concerns:** Distinguishes between the template's core functionality and your application's specific UI and AI prompts.
- **Easy Extensibility:** Designed to be easily extended by adding your own UI components and Gemini prompts.

---

## Quick Start

To get started with this template, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-org/gemini-electron-template.git
    cd gemini-electron-template
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Start the application:**
    ```bash
    npm start
    ```
    This will launch the Electron application and its local backend server.

> **Tip:** If you haven't installed Google's **Gemini CLI**, `npm install` will install it as a local dependency, and `npx gemini` will fall back to it automatically.

---

## Project Structure (Overview)

The project is organized to clearly separate the template's core logic from your application's custom code.

```
.
├── src/
│   ├── core/           # Template Core: DO NOT MODIFY these files unless you know what you're doing.
│   │   ├── main.js         # Electron main process entry point.
│   │   ├── preload.js      # Secure IPC bridge for renderer-main communication.
│   │   ├── ipc-handlers.js # Handles communication between renderer and local server.
│   │   └── server.js       # Local Express server for Gemini CLI integration.
│   │
│   ├── renderer/       # Your Application UI: MODIFY these files to build your UI.
│   │   ├── index.html      # Main HTML file for the user interface.
│   │   ├── renderer.js     # Your UI logic and interaction with the core API.
│   │   └── styles.css      # Your application's styling.
│   │
│   └── prompts/        # Your Gemini Prompts: Add your custom prompt files here.
│       └── readme-prompt.yaml # Example prompt for README generation.
│
├── assets/             # Application assets (e.g., logo).
├── package.json        # Project metadata and dependencies.
├── package-lock.json   # Locked dependencies for reproducible builds.
├── forge.config.js     # Electron Forge configuration for packaging.
└── README.md           # This file.
```

---

## How the Gemini CLI Integration Works

This template uses a local Express server (`src/core/server.js`) to manage the Gemini CLI process. This approach offers several benefits:

- **UI Responsiveness:** Prevents the Electron UI from freezing during long-running Gemini CLI operations.
- **Environment Isolation:** Handles complex command execution and environment setup in a controlled Node.js server environment.
- **Security:** Ensures the Gemini CLI operates within the correct working directory (`cwd`) for security and proper file access.

When you interact with the UI (e.g., drop a folder):

1.  The UI (`src/renderer/renderer.js`) sends a request to the Electron main process (`src/core/ipc-handlers.js`).
2.  The main process forwards this request to the local Express server (`src/core/server.js`).
3.  The server:
    - Scans the dropped folder to create a code outline.
    - Combines the outline with a specified prompt (from `src/prompts/`).
    - Spawns the `npx gemini` command, setting its working directory (`cwd`) to the dropped folder.
    - Streams the Gemini CLI's output back to the Electron app.
4.  The Electron app receives the streamed output and displays it in the UI.

---

## Extending Your Application

This template is designed for easy extension without modifying its core.

### Adding New Gemini Prompts:

1.  Create a new `.yaml` file in the `src/prompts/` directory (e.g., `my-new-feature.yaml`).
2.  Define your Gemini prompt within this file.
3.  In your UI logic (`src/renderer/renderer.js`), you can then call `window.api.processFolderPath(folderPath, 'my-new-feature')` (or a similar API if you customize `ipc-handlers.js` to accept prompt names) to trigger your new prompt.

### Building Your User Interface:

- Modify `src/renderer/index.html` to define your UI structure.
- Write your JavaScript logic in `src/renderer/renderer.js` to handle user interactions and communicate with the core API (`window.api`).
- Style your application using `src/renderer/styles.css`.
- You are free to integrate any frontend framework (React, Vue, Angular, etc.) within the `src/renderer/` directory.

---

## Security Checklist (Already Enabled)

This template comes with secure defaults to protect your application:

- `contextIsolation: true` & `nodeIntegration: false` in `BrowserWindow` settings.
- Strict `Content-Security-Policy` (`default-src 'self'`) in `index.html`.
- Electron Fuses are configured to disable `remote` module and strip unused internals.
- Safe IPC bridge (`src/core/preload.js`) exposes only a minimal, whitelisted API to the renderer.

---

## Scripts

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `npm start`      | Run Electron in dev mode (starts local server) |
| `npm run make`   | Package app for current OS                     |
| `npm run lint`   | ESLint check (auto-fixed on commit via Husky)  |
| `npm run format` | Prettier formatting                            |

---

## License

[MIT](./LICENSE) — free for personal & commercial use.
Made with ❤️
