/**
 * This file is part of the template's core. DO NOT MODIFY.
 *
 * IPC handlers — isolated in their own module so `main.js`
 * stays small and readable.
 *
 * Export `registerIpcHandlers(win)`; call it from main.js
 * once the BrowserWindow is created.
 */

const { ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/* ------------------------------------------------------------------ */
/* Limits to keep the demo snappy                                     */
/* ------------------------------------------------------------------ */

const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 400 * 1024; // 400 KB

/* ------------------------------------------------------------------ */
/* Helper: recursively scan directory → outline JSON                  */
/* ------------------------------------------------------------------ */

function scanFolderOutline(rootDir) {
  const outline = { root: rootDir, files: [] };
  let fileCount = 0;
  let byteCount = 0;

  (function recurse(current) {
    if (fileCount >= MAX_FILES || byteCount >= MAX_TOTAL_BYTES) return;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);

      if (entry.isDirectory()) {
        recurse(full);
      } else {
        if (fileCount >= MAX_FILES || byteCount >= MAX_TOTAL_BYTES) break;

        try {
          const buf = fs.readFileSync(full);
          byteCount += buf.length;
          fileCount += 1;

          const snippet = buf
            .toString('utf8')
            .split(/\r?\n/)
            .slice(0, 10)
            .filter(Boolean)
            .join('\n');

          outline.files.push({
            path: path.relative(rootDir, full),
            size: buf.length,
            snippet,
          });
        } catch {
          /* ignore unreadable file */
        }
      }
    }
  })(rootDir);

  return outline;
}

/* ------------------------------------------------------------------ */
/* Main export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Register IPC handlers for the demo.
 * @param {Electron.BrowserWindow} win – main BrowserWindow
 */
function registerIpcHandlers(win) {
  ipcMain.handle('folder:open-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return undefined;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('folder:selected', async (event, folderPath) => {
    try {
      const response = await fetch('http://localhost:3001/generate-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        dialog.showErrorBox('Server Error', `An error occurred on the server: ${errorText}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let mdBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        mdBuffer += chunk;
        win.webContents.send('readme:chunk', chunk);
      }

      const readmePath = path.join(folderPath, 'README.md');
      fs.writeFileSync(readmePath, mdBuffer, 'utf8');
      win.webContents.send('readme:done', readmePath);

    } catch (error) {
      console.error('Failed to fetch from local server', error);
      dialog.showErrorBox('IPC Error', `Failed to communicate with the local server: ${error.message}`);
    }
  });
}

module.exports = { registerIpcHandlers };
