'use strict';
const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen } = require('electron');
const path = require('path');
const { loadProfiles } = require('./core/profiles');
let win, interactive = false, visible = true;

function create() {
  const { bounds } = screen.getPrimaryDisplay();
  win = new BrowserWindow({ ...bounds, transparent: true, frame: false, alwaysOnTop: true, skipTaskbar: true, resizable: false, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } });
  win.setAlwaysOnTop(true, 'screen-saver');
  setInteractive(false);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}
function setInteractive(on) {
  interactive = on; win.setIgnoreMouseEvents(!on, { forward: true }); if (on) win.focus();
  win.webContents.send('mode', { interactive });
}
app.whenReady().then(() => {
  create();
  globalShortcut.register('Control+Shift+M', () => { visible = !visible; visible ? win.showInactive() : win.hide(); });
  globalShortcut.register('Control+Shift+E', () => setInteractive(!interactive));
  globalShortcut.register('Control+Shift+Q', () => app.quit());
});
ipcMain.handle('profiles', () => loadProfiles(path.join(__dirname, '..', 'profiles')));
ipcMain.handle('capture', async (_e, region) => {
  const { size, scaleFactor } = screen.getPrimaryDisplay();
  const [src] = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: size.width * scaleFactor, height: size.height * scaleFactor } });
  let img = src.thumbnail; if (region) img = img.crop(region);
  return img.toDataURL();
});
ipcMain.on('set-interactive', (_e, on) => setInteractive(!!on));
app.on('will-quit', () => globalShortcut.unregisterAll());
