import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { openDatabase } from './database'
import { registerIpc } from './ipc'
import { createRepository } from './repository'

const createWindow = (): void => {
  const window = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 780,
    minHeight: 560,
    title: 'Deckly Desktop',
    show: false,
    backgroundColor: '#f4f5f7',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.once('ready-to-show', () => window.show())
  void window.loadFile(path.join(__dirname, '../renderer/index.html'))
}

void app.whenReady().then(() => {
  const db = openDatabase(app.getPath('userData'))
  registerIpc(createRepository(db))
  app.once('will-quit', () => db.close())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
