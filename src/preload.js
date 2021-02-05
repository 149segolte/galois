const { contextBridge, remote } = require('electron')
const path = require('path')
const { pipeline } = require('stream')
const fs = require('fs')
const tar = require('tar')
const splitFile = require('split-file')
const crypto = require('crypto')
const zlib = require('zlib')

function getCurrentWindow() {
	return remote.getCurrentWindow();
}

function getDialog() {
	return remote.dialog
}

function getFilesizeInMBytes(filepath) {
	var stats = fs.statSync(filepath)
	var fileSizeInBytes = stats.size
	var fileSizeInMBytes = fileSizeInBytes / (1024 * 1024)
	return fileSizeInMBytes
}

function tarball(files, workDir, output, name) {
	tar.c({
		gzip: false,
		C: workDir
	},
		files
	).pipe(fs.createWriteStream(path.join(output, path.parse(name).name)))
}

function split(output, size, name) {
	let tarFile = []
	tarFile[0] = path.join(output, path.parse(name).name)
	let totalSize = getFilesizeInMBytes(tarFile[0])
	let numPieces = Math.ceil(totalSize / (size * 1024))
	if (numPieces > 1) {
		splitFile.splitFile(tarFile[0], numPieces)
			.then((names) => {
				fs.unlink(tarFile[0], (err) => {
					if (err) throw err;
				});
				return names
			})
			.catch((err) => {
				console.error('Error: ', err)
			})
	} else {
		return tarFile
	}
}

function encryption(file) {
	let handle = {}
	const key = crypto.scryptSync(crypto.randomBytes(16), crypto.randomBytes(32), 32)
	const iv = crypto.randomBytes(16)
	const encrypt = crypto.createCipheriv('aes-256-gcm', key, iv)
	const read = fs.createReadStream(file)
	const write = fs.createWriteStream(file.concat('.aes'))
	pipeline(
		read,
		encrypt,
		write,
		(err) => {
			if (err) {
				console.error('Pipeline failed', err);
			} else {
				fs.unlink(file, (err) => {
					if (err) throw err;
				});
				handle.name = path.basename(file)
				handle.key = key
				handle.iv = iv
				handle.authTag = encrypt.getAuthTag()
				return handle
			}
		}
	)
}

function compress(file) {
	const read = fs.createReadStream(file.concat('.aes'))
	const write = fs.createWriteStream(file)
	const brotli = zlib.createBrotliCompress()
	pipeline(
		read,
		brotli,
		write,
		(err) => {
			if (err) {
				console.error('Pipeline failed', err);
			} else {
				fs.unlink(file.concat('.aes'), (err) => {
					if (err) throw err;
				});
			}
		}
	)
}

contextBridge.exposeInMainWorld('preload', {
	minimize: (browserWindow = getCurrentWindow()) => {
		if (browserWindow.minimizable) {
			browserWindow.minimize();
		}
	},
	close: (browserWindow = getCurrentWindow()) => {
		browserWindow.close();
	},
	fileSelect: async (dialog = getDialog()) => {
		let data = []
		await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections', 'showHiddenFiles', 'dontAddToRecent'] }).then(result => {
			if (result.canceled === false) {
				result.filePaths.forEach((element, index) => {
					let entry = {}
					let size = getFilesizeInMBytes(element)
					entry['#'] = index + 1
					entry.name = path.parse(element).base
					entry.path = element
					if (size < 0.2) {
						entry.size = (size * 1024).toFixed(2).toString().concat(' KB')
					} else {
						entry.size = size.toFixed(2).toString().concat(' MB')
					}
					data[index] = entry
				})
			}
		}).catch(err => {
			console.log(err)
		})
		return data
	},
	folderSelect: async (dialog = getDialog()) => {
		let data = []
		await dialog.showOpenDialog({ properties: ['openDirectory', 'showHiddenFiles', 'dontAddToRecent', 'createDirectory', 'promptToCreate'] }).then(result => {
			if (result.canceled === false) {
				result.filePaths.forEach((element, index) => {
					let entry = {}
					entry['#'] = index + 1
					entry.name = path.basename(element)
					entry.path = element
					data[index] = entry
				})
			}
		}).catch(err => {
			console.log(err)
		})
		return data
	},
	locateOutput: async (dialog = getDialog()) => {
		let path = ''
		await dialog.showOpenDialog({ title: 'Output', buttonLabel: 'Save', properties: ['showHiddenFiles', 'openDirectory', 'dontAddToRecent', 'createDirectory', 'promptToCreate'] }).then(result => {
			path = result.filePaths[0]
		}).catch(err => {
			console.log(err)
		})
		return path
	},
	encrypt: async (data, output, size, name) => {
		let filePaths = []
		let files = []
		let keyset = []
		data.forEach((element, index) => {
			filePaths.push(element.path)
		})
		filePaths.forEach((element, index) => {
			files.push('.'.concat((path.sep)).concat(path.basename(element)))
		})
		tarball(files, path.dirname(filePaths[0]), output, name)
		let tars = split(output, size, name)
		tars.forEach((element, index) => {
			keyset.push(encryption(element))
			compress(element)
		})
	}
})
