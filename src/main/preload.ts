import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  addKeyword: (keyword: string, url: string) => ipcRenderer.invoke('keyword:add', keyword, url),
  getKeywords: () => ipcRenderer.invoke('keyword:list'),
  getRankings: (id: number) => ipcRenderer.invoke('keyword:rankings', id),
});
