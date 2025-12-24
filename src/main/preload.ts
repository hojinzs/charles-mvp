import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Add IPC methods here
  ping: () => ipcRenderer.invoke('ping'),
});
