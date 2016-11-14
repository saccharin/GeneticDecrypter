function Code(code) {
	this.code = code;
	this.uniqueCount = 0;
	this.letterCount = 0;
	this.words = this.extractWords();
	this.letters = this.extractUniqueLetters();
};

Code.prototype.extractWords = function() {
	var fragments = this.code.split(' ');
	var wrds = [];
	var unique = [];
	var self = this;
	
	fragments.forEach(function(f) {
		f = f.trim().toUpperCase();
		f = f.replace(/[^A-Z]/g, '');
		if(f.length == 0)
			return;
		
		wrds.push(new Word(f));
		
		if(unique.indexOf(f) < 0) {
			unique.push(f);
			self.letterCount += f.length;
		}
	});
	
	this.uniqueCount = unique.length;
	
	return wrds;
};
Code.prototype.extractUniqueLetters = function() {
	return this.words.join('').split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; });
};