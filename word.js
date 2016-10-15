function Word(word) {
	this.word = word;
	this.pattern = this.getPattern();
	this.extracted = null;
}

Word.prototype.getPattern = function() {
	var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if(this.pattern != null)
		return this.pattern;
	
	var letters = [];
	
	for(var i=0;i<this.word.length;i++)
		letters.push(0);
	var counter = 1;
	
	for(var i=0, a; a=this.word[i]; i++) {
		if(letters[i] != 0)
			continue;
		
		if(abc.indexOf(a) < 0)
			continue;
		
		letters[i] = counter;
		for(var j=i, b; b=this.word[j]; j++) {
			if(b == a)
				letters[j] = counter;
		}
		counter++;
	}
	
	return letters;
};

Word.prototype.equals = function(other) {
	// http://stackoverflow.com/a/16436975/1451957
	if (this.pattern === other.pattern) return true;
	if (this.pattern == null || other.pattern == null) return false;
	if (this.pattern.length != other.pattern.length) return false;
	
	for (var i = 0; i < this.pattern.length; ++i) {
		if (this.pattern[i] !== other.pattern[i]) return false;
	}
	return true;
};

Word.prototype.extract = function() {
	if(this.extracted == null)
		this.extracted = this.getExtraction();
		
	return this.extracted;
};
Word.prototype.getExtraction = function() {
	return this.word.split('').filter(function(value, index, self) { 
		return self.indexOf(value) === index;
	});
};