function Code(code) {
	this.code = code;
	this.words = this.extractWords();
	this.letters = this.extractUniqueLetters();
};

Code.prototype.extractWords = function() {
	var fragments = this.code.split(' ');
	var wrds = [];
	fragments.forEach(function(f) {
		f = f.trim().toUpperCase();
		f = f.replace(/[^A-Z]/g, '');
		if(f.length == 0)
			return;
		
		wrds.push(new Word(f));
	});
	
	return wrds;
};
Code.prototype.extractUniqueLetters = function() {
	return this.words.join('').split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; });
};