/**
 * This file is part of the template's core. DO NOT MODIFY.
 *
 * Electron main-process entry for the Gemini-CLI template.
 * ─────────────────────────────────────────────────────────
 * Responsibilities:
 *   • Create a secure BrowserWindow
 *   • Register IPC handlers (folder scan → Gemini → README)
 *   • Manage standard Electron lifecycle events
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Register all Gemini-related IPC logic (kept in a separate module for clarity)
const { registerIpcHandlers } = require('./ipc-handlers');

let mainWindow;
let serverProcess;

/* ------------------------------------------------------------------ */
/* Create the main application window                                 */
/* ------------------------------------------------------------------ */
function createWindow() {
  // Start the local server
  serverProcess = spawn('node', [path.join(__dirname, 'server.js')], { stdio: 'inherit' });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process closed with code ${code}`);
  });

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    title: 'Gemini README Demo',
    webPreferences: {
      // Security: Enable contextIsolation and disable nodeIntegration
      // This ensures that your preload script runs in a separate context
      // and the renderer process does not have direct access to Node.js APIs.
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      // Security: Enable sandbox for the renderer process
      sandbox: true,
    },
  });

  // Load the single HTML page (renderer)
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Open DevTools automatically in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Wire up IPC handlers once the window is ready
  registerIpcHandlers(mainWindow);
}

/* ------------------------------------------------------------------ */
/* Electron App Lifecycle                                             */
/* ------------------------------------------------------------------ */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Quit on all platforms except macOS (common UX pattern)
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // macOS: recreate a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
