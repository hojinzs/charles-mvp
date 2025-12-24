import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dbOps } from './db';
import { scheduler } from './scheduler';


// POC: Global reference to keep window alive
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In dev, load Vite server. In prod, load file.
  const isDev = !app.isPackaged; // Simplified check or use env var
  
  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // IPC Handlers
  ipcMain.handle('keyword:add', (_event, keyword, url) => {
    const res = dbOps.addKeyword(keyword, url);
    scheduler.refreshKeywords();
    return res;
  });

  ipcMain.handle('keyword:list', () => {
    return dbOps.getKeywords();
  });

  ipcMain.handle('keyword:add_bulk', (_event, items) => {
    const res = dbOps.addKeywordsBulk(items);
    scheduler.refreshKeywords();
    return res;
  });

  ipcMain.handle('keyword:delete_bulk', (_event, ids) => {
    const res = dbOps.deleteKeywordsBulk(ids);
    scheduler.refreshKeywords(); // Refresh scheduler to stop monitoring deleted keywords
    return res;
  });

  ipcMain.handle('keyword:rankings', (_event, id) => {
    return dbOps.getRankings(id);
  });

  ipcMain.handle('keyword:history_all', () => {
    return dbOps.getAllRankings();
  });

  // Scheduler IPC
  ipcMain.handle('scheduler:set_interval', (_event, ms) => {
    scheduler.setInterval(ms);
  });

  ipcMain.handle('scheduler:get_state', () => {
    return {
      interval: scheduler.getInterval(),
      isRunning: scheduler.getStatus(),
    };
  });

  ipcMain.handle('scheduler:get_queue', () => {
    return scheduler.getQueue();
  });

  // Start Scheduler
  scheduler.start();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
