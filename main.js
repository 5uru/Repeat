const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    // Check if we're in development or production
    if (process.env.NODE_ENV !== 'production') {
        // In development, use the live server provided by Vite
        win.loadURL('http://localhost:5173').catch(e => {
            console.error('Failed to load app:', e)
        })
        win.webContents.openDevTools()
    } else {
        // In production, load the built files
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        })).catch(e => {
            console.error('Failed to load app:', e)
        })
    }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})