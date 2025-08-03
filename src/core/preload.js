/**
 * This file is part of the template's core. DO NOT MODIFY.
 *
 * Preload script
 *  - Runs in an isolated context (contextIsolation: true)
 *  - Exposes a minimal, whitelisted API to the renderer
 *  - Guards against prototype-pollution and other injection vectors
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  /**
   * Opens a folder selection dialog and returns the selected path.
   * @returns {Promise<string|undefined>} The selected folder path, or undefined if cancelled.
   */
  openFolderDialog: () => ipcRenderer.invoke('folder:open-dialog'),

  /**
   * Sends the selected folder path to the main process for processing.
   * @param {string} folderPath - The absolute path to the selected folder.
   */
  processFolderPath: (folderPath) => {
    if (typeof folderPath !== 'string' || folderPath.length === 0) return;
    return ipcRenderer.invoke('folder:selected', folderPath);
  },

  /**
   * Listen for streamed README chunks.
   * @param {(chunk:string)=>void} callback
   */
  onReadmeChunk: (callback) => {
    if (typeof callback !== 'function') return;
    ipcRenderer.on('readme:chunk', (_, chunk) => callback(chunk));
  },

  /**
   * Fired once the README is fully generated and saved.
   * @param {(filePath:string)=>void} callback
   */
  onReadmeDone: (callback) => {
    if (typeof callback !== 'function') return;
    ipcRenderer.once('readme:done', (_, path) => callback(path));
  },
});
