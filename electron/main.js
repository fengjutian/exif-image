import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import squirrel from 'electron-squirrel-startup'
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (squirrel) {
  app.quit()
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
  })

  const viteDevServerUrl = globalThis.process?.env?.VITE_DEV_SERVER_URL;
  if (viteDevServerUrl) {
    mainWindow.loadURL(viteDevServerUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: '打开文件夹',
      submenu: [
        {
          label: '打开文件夹…',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {

            // eslint-disable-next-line no-undef
            switch (process.platform) {
              case 'win32':
                console.log('当前系统是 Windows');
                // 执行 Windows 特有的代码
                break;
              case 'darwin':
                console.log('当前系统是 macOS');
                // 执行 macOS 特有的代码
                break;
              case 'linux':
                console.log('当前系统是 Linux');
                // 执行 Linux 特有的代码
                break;
              default:
                console.log('未知的操作系统');
            }
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile',  'multiSelections'],
              filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif']},
                { name: '所有文件', extensions: ['*'] }]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const dirPath = result.filePaths[0];

              // 方式 A：直接把文件夹在系统资源管理器/访达里打开
              // shell.openPath(dirPath);

              // 方式 B：把路径发给你的渲染进程，自己渲染目录内容
              mainWindow.webContents.send('dir-selected', dirPath);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const menu = Menu.buildFromTemplate([{
  label: '选择文件夹',
  click: async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled) {
      console.log('选中路径:', result.filePaths)
    }
  }
}])
Menu.setApplicationMenu(menu)

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 支持的图片扩展名
const IMG_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'];

ipcMain.handle('get-images-in-dir', async (_, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    // 过滤掉子目录、过滤扩展名
    return files
      .filter(f => f.isFile() && IMG_EXT.includes(path.extname(f.name).toLowerCase()))
      .map(f => path.join(dirPath, f.name));   // 返回绝对路径
  } catch (err) {
    console.error(err);
    return [];
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('open-file-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
    });
    if (result.canceled) {
      return null;
    }
    return result.filePaths;
  } catch (err) {
    console.error('Failed to open dialog', err);
    return [];
  }
});


ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
  })
  return result.filePaths
})

ipcMain.handle('get-folder-images', async (_, folderPath) => {
  console.log('11111111:', folderPath);
  const files = fs.readdirSync(folderPath)
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
  }).map(file => path.join(folderPath, file))
})