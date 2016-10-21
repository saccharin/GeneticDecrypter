// render.js

var Renderer = function(canvas)
{
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
}

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
		
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x - size/2, y - size/2, size, size);
		this.ctx.textAlign = 'center';
		
		this.ctx.font = '10px Arial';
		this.ctx.fillText(solution.getDna(), x, y - (baseSize / 2), baseSize);
	}
}