import { Toast } from 'bootstrap'
import './index.scss'

var selectedData = []
var outputPath = ''
var pieceSize = 0
var outputName = ''

function handleWindowControls() {
	document.getElementById('min-button').addEventListener("click", () => {
		window.preload.minimize()
	})

	document.getElementById('close-button').addEventListener("click", () => {
		window.preload.close()
	})
}

function genTable(element, data) {
	element.innerHTML = ''

	let headers = Object.keys(data[0])
	let thead = document.createElement('thead')
	let tbody = document.createElement('tbody')
	let headerRow = document.createElement('tr')

	headers.forEach((head) => {
		let header = document.createElement('th')
		header.innerHTML = head.toUpperCase()
		header.setAttribute('scope', 'col')
		headerRow.appendChild(header)
	})

	data.forEach((slice, index) => {
		let tr = document.createElement('tr')
		headers.forEach((head) => {
			if (head === '#') {
				let th = document.createElement('th')
				th.innerHTML = slice[head]
				th.setAttribute('scope', 'row')
				tr.appendChild(th)
			} else {
				let td = document.createElement('td')
				td.innerHTML = slice[head]
				tr.appendChild(td)
			}
		})
		tbody.appendChild(tr)
	})

	thead.appendChild(headerRow)
	element.appendChild(thead)
	element.appendChild(tbody)
}

function warning(warn) {
	var toastElList = [].slice.call(document.querySelectorAll('.toast-warn'))
	var toastList = toastElList.map(function (toastEl) {
		return new Toast(toastEl, { delay: 2500 })
	})
	document.getElementById('toast-warn-body').innerHTML = warn
	toastList[0].show()
}

function addListeners() {
	document.getElementById('fileSelect').addEventListener("click", () => {
		window.preload.fileSelect().then((result) => {
			if (result.length !== 0) {
				selectedData = result
				document.getElementById('selectMenu').style.display = 'none'
				genTable(document.getElementById('detailsTable'), result)
				document.getElementById('details').style.display = 'flex'
			}
		})
	})

	document.getElementById('folderSelect').addEventListener("click", () => {
		window.preload.folderSelect().then((result) => {
			if (result.length !== 0) {
				selectedData = result
				document.getElementById('selectMenu').style.display = 'none'
				genTable(document.getElementById('detailsTable'), result)
				document.getElementById('details').style.display = 'flex'
			}
		})
	})

	document.getElementById('clearTable').addEventListener("click", () => {
		selectedData.length = 0
		document.getElementById('selectMenu').style.display = 'flex'
		document.getElementById('details').style.display = 'none'
	})

	document.getElementById('outputBtn').addEventListener("click", () => {
		window.preload.locateOutput().then((result) => {
			if (result.length !== 0) {
				outputPath = result
				document.getElementById('outputPath').innerHTML = result
				document.getElementById('outputPath').style.display = 'flex'
				document.getElementById('changeBtn').style.display = 'flex'
				document.getElementById('outputBtn').style.display = 'none'
			}
		})
	})

	document.getElementById('changeBtn').addEventListener("click", () => {
		document.getElementById('outputPath').style.display = 'none'
		document.getElementById('changeBtn').style.display = 'none'
		document.getElementById('outputBtn').style.display = 'flex'
		outputPath = ''
	})

	document.getElementById('pieceSize').addEventListener("focusout", () => {
		pieceSize = document.getElementById('pieceSize').value
	})

	document.getElementById('outputName').addEventListener("focusout", () => {
		outputName = document.getElementById('outputName').value
	})

	document.getElementById('start').addEventListener("click", () => {
		if (typeof selectedData === 'undefined' || selectedData.length < 1) {
			warning('No Files Selected!')
		} else {
			if (typeof outputPath === 'undefined' || outputPath.length < 1) {
				warning('No Output Path!')
			} else {
				if (pieceSize < 0.1 || pieceSize > 5 || typeof pieceSize === 'undefined') {
					warning('Invalid Piece Size!')
				} else {
					if (typeof outputName === 'undefined' || outputName.length < 1) {
						warning('No Name Provided!')
					} else {
						window.preload.encrypt(selectedData, outputPath, pieceSize, outputName).then(() => {
							var toastElList = [].slice.call(document.querySelectorAll('.toast-mess'))
							var toastList = toastElList.map(function (toastEl) {
								return new Toast(toastEl, { delay: 2500 })
							})
							document.getElementById('toast-mess-body').innerHTML = 'Task Completed!'
							toastList[0].show()
							document.getElementById('loading').style.display = 'none'
							document.getElementById('start').style.display = 'flex'
						})
						document.getElementById('start').style.display = 'none'
						document.getElementById('loading').style.display = 'flex'
					}
				}
			}
		}
	})
}

document.onreadystatechange = () => { // When document has loaded, initialise
	if (document.readyState == "complete") {
		handleWindowControls()
		document.getElementById('details').style.display = 'none'
		document.getElementById('outputPath').style.display = 'none'
		document.getElementById('changeBtn').style.display = 'none'
		document.getElementById('loading').style.display = 'none'
		addListeners()
	}
}
