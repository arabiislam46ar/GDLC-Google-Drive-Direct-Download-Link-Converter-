const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  convertLink: (url) => ipcRenderer.invoke('convert-link', url),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  showDialog: (type, message) => ipcRenderer.invoke('show-dialog', type, message)
});