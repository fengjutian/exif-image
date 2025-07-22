import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getImages: () => ipcRenderer.invoke('open-file-dialog'),
  getImagesInDir: (dirPath) => ipcRenderer.invoke('get-images-in-dir', dirPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  getFolderImages: (folderPath) => ipcRenderer.invoke('get-folder-images', folderPath),
  // openFiles: (filePaths) => ipcRenderer.invoke('dir-selected', filePaths),
  onDirSelected: (callback) => {
    // 把渲染进程的回调包一层，再转发给真正的 ipcRenderer
    ipcRenderer.on('dir-selected', (_e, value) => callback(value));
  }
})

// renderer.js
// const { ipcRenderer } = require('electron');

// ipcRenderer.on('dir-selected', (e, dirPath) => {
//   console.log('用户选了目录：', dirPath);
//   // 这里你可以用 fs.readdir(dirPath) 把文件读出来渲染
// });