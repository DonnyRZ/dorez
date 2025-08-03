/*
 * This is the main renderer process script for your application.
 * Interact with the Electron main process via `window.api`.
 * Build your UI and application logic here.
 */

const dropzone = document.getElementById('dropzone');
const spinner = document.getElementById('spinner');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');

// Helper: show / hide elements
const hide = (el) => el.classList.add('hidden');
const show = (el) => el.classList.remove('hidden');

/* -------------------------------------------------------------
   Folder Selection Handler
----------------------------------------------------------------*/
dropzone.addEventListener('click', async () => {
  show(spinner);
  hide(dropzone);
  preview.textContent = '';
  hide(preview);

  try {
    const folderPath = await window.api.openFolderDialog();
    if (folderPath) {
      await window.api.processFolderPath(folderPath);
    } else {
      // User cancelled the dialog
      hide(spinner);
      show(dropzone);
      showToast('Folder selection cancelled.');
    }
  } catch (error) {
    console.error('[Renderer] Error opening folder dialog:', error);
    showToast(`Error: ${error.message}`);
    hide(spinner);
    show(dropzone);
  }
});

/* -------------------------------------------------------------
   Core Flow (triggered after folder selection)
----------------------------------------------------------------*/
window.api.onReadmeChunk((chunk) => {
  preview.textContent += chunk;
  if (preview.classList.contains('hidden')) show(preview);
});

window.api.onReadmeDone((readmePath) => {
  hide(spinner);
  showToast(`README saved → ${readmePath}`);
  show(dropzone); // Show dropzone again for new selection
});

/* -------------------------------------------------------------
   Toast Utility
----------------------------------------------------------------*/
function showToast(message, duration = 4000) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
