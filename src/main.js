const { app, BrowserWindow, ipcMain, clipboard, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // স্ক্রীন সাইজ পাওয়া
  const { width: screenWidth, height: screenHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  
  // উইন্ডো সাইজ সেট করা (স্ক্রীনের 80% জুড়ে)
  const windowWidth = Math.min(1200, Math.floor(screenWidth * 0.8));
  const windowHeight = Math.min(800, Math.floor(screenHeight * 0.8));
  
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
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
    minWidth: 800,
    minHeight: 600,
    // উইন্ডোকে স্ক্রীন কেন্দ্রে স্থাপন করা
    center: true,
    // উইন্ডো টাইটেল
    title: 'GDLC - Google Drive Direct Link Converter'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // ডেভেলপার টুলস (শুধুমাত্র ডেভেলপমেন্টে)
    // mainWindow.webContents.openDevTools();
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

// Google Drive লিংক কনভার্ট করার ফাংশন
function convertGoogleDriveLink(url) {
  try {
    // বিভিন্ন ফরম্যাটের Google Drive লিংক হ্যান্ডেল করা
    let fileId = '';
    
    if (url.includes('/d/')) {
      // Standard format: https://drive.google.com/file/d/FILE_ID/view
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
      // Alternative format: https://drive.google.com/open?id=FILE_ID
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/file/d/')) {
      // Mobile format: https://drive.google.com/file/d/FILE_ID/edit
      fileId = url.split('/file/d/')[1].split('/')[0];
    } else {
      return { success: false, error: 'Invalid Google Drive link format' };
    }
    
    // Validate file ID (should be at least 20 characters)
    if (fileId.length < 20) {
      return { success: false, error: 'Invalid Google Drive file ID' };
    }
    
    const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return { success: true, directLink };
  } catch (error) {
    return { success: false, error: 'Failed to process the link' };
  }
}

// আইপিসি হ্যান্ডলার
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