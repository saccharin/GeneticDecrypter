// render.js
// with <3 from http://jsfiddle.net/m1erickson/sAFku/ and http://stackoverflow.com/a/16630594/1451957

var Renderer = function(canvas)
{
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');

	var canvasOffset = $(canvas).offset();
	this.offsetX = canvasOffset.left;
	this.offsetY = canvasOffset.top;

	this.elements = [];
	
	var self = this;
	$(canvas).click(function(e) {
		return self.handleMouseDown(e);
	});
	$(canvas).mousemove(function(e) {
		return self.handleMouseMove(e);
	});
}

var Rect = (function () {
	
	// constructor
	function rect(context, id, x, y, width, height, fill, stroke, strokewidth) {
		this.context = context;

		this.x = x;
		this.y = y;
		this.id = id;
		this.width = width;
		this.height = height;
		this.fill = fill || "gray";
		this.stroke = stroke || "skyblue";
		this.strokewidth = strokewidth || 2;
		
		this.redraw(this.x, this.y);
		return (this);
	}
	rect.prototype.redraw = function (x, y) {
		this.x = x || this.x;
		this.y = y || this.y;
		this.draw('#FFFFFF');
		return (this);
	}
	//
	rect.prototype.highlight = function (x, y) {
		this.x = x || this.x;
		this.y = y || this.y;
		this.draw(this.stroke);
		return (this);
	}
	//
	rect.prototype.draw = function (stroke) {
		this.context.ctx.save();
		this.context.ctx.beginPath();
		this.context.ctx.fillStyle = this.fill;
		this.context.ctx.strokeStyle = stroke;
		this.context.ctx.lineWidth = this.strokewidth;
		this.context.ctx.rect(this.x, this.y, this.width, this.height);
		this.context.ctx.stroke();
		this.context.ctx.fill();
		this.context.ctx.restore();
	}
	//
	rect.prototype.isPointInside = function (x, y) {
		return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height);
	}


	return rect;
})();


Renderer.prototype.handleMouseDown = function(e) {
	mouseX = parseInt(e.clientX - this.offsetX);
	mouseY = parseInt(e.clientY - this.offsetY);

	// Put your mousedown stuff here
	var clicked = "";
	for (var i = 0; i < this.elements.length; i++) {
		if (this.elements[i].isPointInside(mouseX, mouseY)) {
			clicked += this.elements[i].id + " "
		}
	}
	if (clicked.length > 0) {
		alert("Clicked rectangles: " + clicked);
	}
};

Renderer.prototype.handleMouseMove = function(e) {
	mouseX = parseInt(e.clientX - this.offsetX);
	mouseY = parseInt(e.clientY - this.offsetY);
	
	// Put your mousemove stuff here
	//this.ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for (var i = 0; i < this.elements.length; i++) {
		if (this.elements[i].isPointInside(mouseX, mouseY)) {
			this.elements[i].highlight();
		} else {
			this.elements[i].redraw();
		}
	}
}


        //

// http://stackoverflow.com/a/17846951/1451957
Renderer.getColor = function(str) {
	return '#' + ('000000' +(parseInt(parseInt(str, 36).toExponential().slice(2,-5), 10) & 0xFFFFFF).toString(16).toUpperCase()).slice(-6);
}

Renderer.prototype.renderSolutions = function(generation, solutions)
{
	for(var i=0,solution;solution=solutions[i];i++)
	{
		var text = solution.score.decrypted;
		var color = Renderer.getColor(solution.getDna());
		var x = (canvas.width / (solutions.length)) * (.5 + i);
		var y = canvas.height / 2;
		var baseSize = canvas.width / (solutions.length + 2);
		var size = solution.score.score * baseSize || 5;
		
		var r = new Rect(this, text, x, y, size, size, color, color, 5);
		this.elements.push(r);
		/*
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x - size/2, y - size/2, size, size);
		this.ctx.textAlign = 'center';
		
		this.ctx.font = '10px Arial';
		this.ctx.fillText(solution.getDna(), x, y - (baseSize / 2), baseSize);
		*/
	}
}