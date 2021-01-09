const { BrowserWindow } = require('electron')

// default window settings
const defaultProps = {
	width: 1080,
	height: 720,
	minWidth: 800,
	minHeight: 600,
	maxWidth: 1080,
	maxHeight: 720,
	show: false,
	frame: false,
	backgroundColor: '#FFF',

	// update for electron V5+
	webPreferences: {
		nodeIntegration: true,
		enableRemoteModule: true
	}
}

class Window extends BrowserWindow {
	constructor({ file, ...windowSettings }) {
		// calls new BrowserWindow with these props
		super({ ...defaultProps, ...windowSettings })

		// load the html and open devtools
		this.loadURL(file);

		// gracefully show when ready to prevent flickering
		this.once('ready-to-show', () => {
			this.show()
		})
	}
}

module.exports = Window