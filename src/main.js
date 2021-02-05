const { app, BrowserWindow } = require('electron');
const path = require('path')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit()
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1080,
		height: 720,
		resizable: false,
		show: false,
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, './preload.js'),
			contextIsolation: true,
			enableRemoteModule: true
		}
	});

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (Window.getAllWindows().length === 0) {
		createWindow()
	}
})