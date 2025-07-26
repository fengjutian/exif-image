import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getImages: () => ipcRenderer.invoke('open-file-dialog'),
  getImagesInDir: (dirPath) => ipcRenderer.invoke('get-images-in-dir', dirPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  getFolderImages: (folderPath) => ipcRenderer.invoke('get-folder-images', folderPath),
  onDirSelected: (callback) => {
    // 把渲染进程的回调包一层，再转发给真正的 ipcRenderer
    ipcRenderer.on('dir-selected', (_e, value) => callback(value));
  }
})