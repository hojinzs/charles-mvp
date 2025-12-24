import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  addKeyword: (keyword: string, url: string) => ipcRenderer.invoke('keyword:add', keyword, url),
  addKeywordsBulk: (items: {keyword: string, url: string}[]) => ipcRenderer.invoke('keyword:add_bulk', items),
  deleteKeywords: (ids: number[]) => ipcRenderer.invoke('keyword:delete_bulk', ids),
  getKeywords: () => ipcRenderer.invoke('keyword:list'),
  getRankings: (id: number) => ipcRenderer.invoke('keyword:rankings', id),
  getAllHistory: () => ipcRenderer.invoke('keyword:history_all'),
  setSchedulerInterval: (ms: number) => ipcRenderer.invoke('scheduler:set_interval', ms),
  getSchedulerState: () => ipcRenderer.invoke('scheduler:get_state'),
  getSchedulerQueue: () => ipcRenderer.invoke('scheduler:get_queue'),
});
