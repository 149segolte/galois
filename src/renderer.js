/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import bootstrap from 'bootstrap';
import './index.scss';

const remote = require('electron').remote;

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = () => {
	if (document.readyState == "complete") {
		handleWindowControls();
	}
};

window.onbeforeunload = () => {
	/* If window is reloaded, remove win event listeners
	(DOM element listeners get auto garbage collected but not
	Electron win listeners as the win is not dereferenced unless closed) */
	win.removeAllListeners();
}

function handleWindowControls() {
	// Make minimise/maximise/restore/close buttons work when they are clicked
	document.getElementById('min-button').addEventListener("click", () => {
		win.minimize();
	});

	document.getElementById('max-button').addEventListener("click", () => {
		win.maximize();
	});

	document.getElementById('restore-button').addEventListener("click", () => {
		win.unmaximize();
	});

	document.getElementById('close-button').addEventListener("click", () => {
		win.close();
	});

	// Toggle maximise/restore buttons when maximisation/unmaximisation occurs
	toggleMaxRestoreButtons();
	win.on('maximize', toggleMaxRestoreButtons);
	win.on('unmaximize', toggleMaxRestoreButtons);

	function toggleMaxRestoreButtons() {
		if (win.isMaximized()) {
			document.body.classList.add('maximized');
		} else {
			document.body.classList.remove('maximized');
		}
	}
}