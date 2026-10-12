const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('overlay', {
  profiles: () => ipcRenderer.invoke('profiles'),
  capture: (region) => ipcRenderer.invoke('capture', region),
  setInteractive: (on) => ipcRenderer.send('set-interactive', on),
  onMode: (cb) => ipcRenderer.on('mode', (_e, m) => cb(m))
});
