function QuickGrid() {
		var quickGrid = this;
		this.canvas;
		this.context;
		this.title;
		this.alphaSlider;
		this.size 	= 10;
		this.alpha 	= 10;
	
		this.init = function() {
				this.canvas 								= document.createElement("canvas");
				this.canvas.id  						= "GridLayer";
				this.canvas.height 					= window.outerHeight;
				this.canvas.width  					= window.outerWidth;
				this.canvas.style.zIndex 		= "100000";
				this.canvas.style.position 	= "fixed";
				this.canvas.style.visibility= "visible";
				this.canvas.style.top 			= "0";
				this.canvas.style.left 			= "0";
				this.canvas.style.margin 		= "0";
				this.canvas.style.padding 	= "0";
				this.canvas.style.background= "rgba(0,0,0,0)";
				this.canvas.addEventListener(
						"click",
						function(event) {
								quickGrid.canvas.style.visibility = "hidden";
								try {
										document.elementFromPoint(event.pageX, event.pageY).click();
										quickGrid.cleanUp();
								} catch(err) {
										quickGrid.canvas.style.visibility= "visible";
								}
						},
						false
				);
				this.context = this.canvas.getContext('2d');
				document.body.appendChild(this.canvas);
				
				this.drawGrid(this.alpha);
				
				this.title 											= document.createElement("h2");
				this.title.id										= "Transparency";
				this.title.innerHTML 						= "QuickGrid Transparency";
				this.title.style.color					= "white";
				this.title.style.zIndex					= "100001";
				this.title.style.position 			= "fixed";
				this.title.style.top 						= "20px";
				this.title.style.left 					= "20px";
				this.title.style.width					= "200px";
				this.title.style.height					= "100px";
				this.title.style.margin 				= "0";
				this.title.style.padding 				= "20px";
				this.title.style.textAlign			= "center";
				this.title.style.fontFamily			= "Arial";
				this.title.style.fontWeight			= "normal";
				this.title.style.fontSize				= "20px";
				this.title.style.background		 	= "rgba(0,0,0,0.6)";
				this.title.style.borderRadius 	= "5px";
				document.body.appendChild(this.title);
			
				this.alphaSlider									= document.createElement("input");
				this.alphaSlider.type 						= "range";
				this.alphaSlider.min							= "5";
				this.alphaSlider.max							= "30";
				this.alphaSlider.value						= this.alpha;
				this.alphaSlider.style.zIndex			= "100001";
				this.alphaSlider.style.width			= "160px";
				this.alphaSlider.style.margin 		= "0";
				this.alphaSlider.style.padding 		= "0";
				this.alphaSlider.addEventListener(
					 'change',
					 function() { quickGrid.drawGrid(this.value) },
					 false
				);
				this.title.appendChild(this.alphaSlider);
		}
		
		this.drawGrid = function(alpha) {
				alpha = alpha/100;

				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.beginPath();
				
				for(var i = 0; i < this.canvas.width; i += 2*this.size) {
						for(var j = 0; j < this.canvas.height; j += this.size) {
								if((j/this.size)%2) 	{
										this.context.fillStyle = 'rgba(0,0,0,'+alpha+')';
										this.context.fillRect(i, j, this.size, this.size);
										this.context.fillStyle = 'rgba(255,255,255,'+alpha+')';
										this.context.fillRect(i+this.size, j, this.size, this.size);
								}
								else {
										this.context.fillStyle = 'rgba(255,255,255,'+alpha+')';
										this.context.fillRect(i, j, this.size, this.size);
										this.context.fillStyle = 'rgba(0,0,0,'+alpha+')';
										this.context.fillRect(i+this.size, j, this.size, this.size);
								}
						}
				}
		}
		
		this.cleanUp = function() {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				document.body.removeChild(this.canvas);
				document.body.removeChild(this.title);
		}
}

if(!quickGridChromeExtension) {
		var quickGridChromeExtension = new QuickGrid();
				quickGridChromeExtension.init();
} else {
		quickGridChromeExtension.cleanUp();
		quickGridChromeExtension = null;
}