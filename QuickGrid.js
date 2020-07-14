// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
	e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
	if (keys[e.keyCode]) {
		preventDefault(e);
		return false;
	}
}

const wheelOpt = { passive: false };
const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function disableScroll() {
	window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
	window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
	window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
	window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
	window.removeEventListener('DOMMouseScroll', preventDefault, false);
	window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
	window.removeEventListener('touchmove', preventDefault, wheelOpt);
	window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}


class QuickGrid {
	canvas;
	settingsContainer;
	isScrollEnabled = true;
	size = 10;
	alpha = 10;

	get context() {
		return this.canvas.getContext('2d');
	}

	constructor() {
		this.createCanvas();
		this.drawGrid();
		this.createSettingsContainer();
		this.createAlphaSlider();
		this.createSizeSlider();
		this.createScrollToggle();
		this.setupResizeListener();
	}

	createCanvas() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "quickgrid";
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.canvas.style.zIndex = "100000";
		this.canvas.style.position = "fixed";
		this.canvas.style.visibility = "visible";
		this.canvas.style.top = "0";
		this.canvas.style.left = "0";
		this.canvas.style.margin = "0";
		this.canvas.style.padding = "0";
		this.canvas.style.background = "rgba(0,0,0,0)";
		this.canvas.style.pointerEvents = "none";
		document.body.appendChild(this.canvas);
	}

	createSettingsContainer() {
		this.settingsContainer = document.createElement("div");
		this.settingsContainer.id = "quickgrid-settings";
		this.settingsContainer.style.zIndex = "100001";
		this.settingsContainer.style.position = "fixed";
		this.settingsContainer.style.top = "20px";
		this.settingsContainer.style.left = "20px";
		this.settingsContainer.style.width = "320px";
		this.settingsContainer.style.height = "auto";
		this.settingsContainer.style.margin = "0";
		this.settingsContainer.style.padding = "20px";
		this.settingsContainer.style.background = "rgba(0,0,0,0.6)";
		this.settingsContainer.style.backdropFilter = "blur(5px)";
		this.settingsContainer.style.borderRadius = "5px";
		this.settingsContainer.style.userSelect = "none";
		this.settingsContainer.style.color = "white";
		document.body.appendChild(this.settingsContainer);

		const settingsHeader = document.createElement("h2");
		settingsHeader.innerText = "QuickGrid Settings";
		settingsHeader.style.fontSize = "20px";
		settingsHeader.style.textAlign = "left";
		settingsHeader.style.lineHeight = "1.1";
		settingsHeader.style.fontWeight = "normal";
		settingsHeader.style.fontFamily = "Arial";
		settingsHeader.style.textTransform = "none";
		this.settingsContainer.appendChild(settingsHeader);
		this.setupDragListener(settingsHeader);
	}

	createAlphaSlider() {
		const label = document.createElement("h3");
		label.innerText = "Adjust Transparency";
		label.for = "quickgrid-alpha-slider";
		label.style.marginTop = "12px";
		label.style.fontSize = "14px";
		this.settingsContainer.appendChild(label);

		const alphaSlider = document.createElement("input");
		alphaSlider.id = "quickgrid-alpha-slider";;
		alphaSlider.type = "range";
		alphaSlider.min = "5";
		alphaSlider.max = "30";
		alphaSlider.value = this.alpha;
		alphaSlider.style.zIndex = "100001";
		alphaSlider.style.width = "100%";
		alphaSlider.style.margin = "0";
		alphaSlider.style.padding = "0";
		alphaSlider.addEventListener(
			'change',
			(event) => this.drawGrid({ alpha: parseInt(event.target.value, 10) }),
			false
		);
		this.settingsContainer.appendChild(alphaSlider);
	}

	createSizeSlider() {
		const label = document.createElement("h3");
		label.innerText = "Adjust Size";
		label.for = "quickgrid-size-slider";
		label.style.marginTop = "12px";
		label.style.fontSize = "14px";
		this.settingsContainer.appendChild(label);

		const sizeSlider = document.createElement("input");
		sizeSlider.id = "quickgrid-size-slider";
		sizeSlider.type = "range";
		sizeSlider.min = "1";
		sizeSlider.max = "50";
		sizeSlider.value = this.size;
		sizeSlider.style.zIndex = "100001";
		sizeSlider.style.width = "100%";
		sizeSlider.style.margin = "0";
		sizeSlider.style.padding = "0";
		sizeSlider.addEventListener(
			'change',
			(event) => this.drawGrid({ size: parseInt(event.target.value, 10) }),
			false
		);
		this.settingsContainer.appendChild(sizeSlider);
	}

	createScrollToggle() {
		const label = document.createElement("h3");
		label.innerText = "Disable Scrolling";
		label.for = "quickgrid-size-slider";
		label.style.marginTop = "12px";
		label.style.fontSize = "14px";
		label.style.display = "inline-block";
		this.settingsContainer.appendChild(label);

		const scrollToggle = document.createElement("input");
		scrollToggle.id = "quickgrid-scroll-toggle";
		scrollToggle.type = "checkbox";
		scrollToggle.value = !this.isScrollEnabled;
		scrollToggle.style.zIndex = "100001";
		scrollToggle.style.margin = "0";
		scrollToggle.style.marginTop = "1px";
		scrollToggle.style.marginLeft = "12px";
		scrollToggle.style.padding = "0";
		scrollToggle.style.display = "inline-block";
		scrollToggle.addEventListener(
			'change',
			() => {
				if (this.isScrollEnabled) {
					this.isScrollEnabled = false;
					disableScroll();
				} else {
					this.isScrollEnabled = true;
					enableScroll();
				}
			},
			false
		);
		this.settingsContainer.appendChild(scrollToggle);
	}

	drawGrid({ alpha = this.alpha, size = this.size } = {}) {
		this.alpha = alpha;
		this.size = size;

		// Clear grid.
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.beginPath();

		console.log(this.alpha, this.size)

		// Redraw grid.
		const alphaPercentage = alpha / 100;
		for (let i = 0; i < this.canvas.width; i += 2 * size) {
			for (let j = 0; j < this.canvas.height; j += size) {
				if ((j / size) % 2) {
					this.context.fillStyle = 'rgba(0,0,0,' + alphaPercentage + ')';
					this.context.fillRect(i, j, size, size);
					this.context.fillStyle = 'rgba(255,255,255,' + alphaPercentage + ')';
					this.context.fillRect(i + size, j, size, size);
				}
				else {
					this.context.fillStyle = 'rgba(255,255,255,' + alphaPercentage + ')';
					this.context.fillRect(i, j, size, size);
					this.context.fillStyle = 'rgba(0,0,0,' + alphaPercentage + ')';
					this.context.fillRect(i + size, j, size, size);
				}
			}
		}
	}

	setupResizeListener() {
		window.addEventListener('resize', () => {
			this.canvas.height = window.innerHeight;
			this.canvas.width = window.innerWidth;
			this.drawGrid();
		});
	}

	setupDragListener(element) {
		element.addEventListener('mousedown', onMouseDown);

		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		function onMouseDown(event) {
			event.preventDefault();

			// get the mouse cursor position at startup:
			pos3 = event.clientX;
			pos4 = event.clientY;
			document.addEventListener('mouseup', onMouseUp);

			// call a function whenever the cursor moves:
			document.addEventListener('mousemove', onMouseMove);
		}

		function onMouseMove(event) {
			event.preventDefault();

			// calculate the new cursor position:
			pos1 = pos3 - event.clientX;
			pos2 = pos4 - event.clientY;
			pos3 = event.clientX;
			pos4 = event.clientY;

			// set the element's new position:
			element.style.top = (element.offsetTop - pos2) + "px";
			element.style.left = (element.offsetLeft - pos1) + "px";
		}

		function onMouseUp() {
			// stop moving when mouse button is released:
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('mousemove', onMouseMove);
		}
	}

	cleanUp() {
		if (document.getElementById('QuickGrid')) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			document.body.removeChild(this.canvas);
			document.body.removeChild(this.settingsContainer);
			document.head.removeChild(this.documentStyles);
			this.canvas = null;
			this.settingsContainer = null;
			this.documentStyles = null;
			return true;
		} else return false;
	}
}

if(!quickGridChromeExtension) {
	var quickGridChromeExtension = new QuickGrid();
} else {
	quickGridChromeExtension.cleanUp();
}
