const { app, BrowserWindow, ipcMain, clipboard, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    minWidth: 650,
    minHeight: 550
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function convertGoogleDriveLink(url) {
  try {
    let fileId = '';
    
    if (url.includes('/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0];
    } else {
      return { success: false, error: 'Invalid Google Drive link format' };
    }
    
    if (fileId.length < 20) {
      return { success: false, error: 'Invalid Google Drive file ID' };
    }
    
    const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return { success: true, directLink };
  } catch (error) {
    return { success: false, error: 'Failed to process the link' };
  }
}

ipcMain.handle('convert-link', (event, url) => {
  return convertGoogleDriveLink(url);
});

ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('show-dialog', (event, type, message) => {
  const options = {
    type: type || 'info',
    buttons: ['OK'],
    defaultId: 0,
    title: 'GDLC',
    message: message
  };
  
  return dialog.showMessageBox(mainWindow, options);
});