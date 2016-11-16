function Solution(matches, code, history) {
	this.matches = matches;
	this.code = code;
	
	this.score = null;
	this.history = history || [];
	this.children = [];
	
	this.distinctWordCount = 0;
};

Solution.prototype.solve = function() {
	var out = [];
	
	for(var i=0; i<this.code.code.length; i++) {
		var a = this.code.code[i];
		
		var f = this.matches.find(function(x) { return x.code == a; });
		if(f == null)
		{
			if(Constants.alphabet.indexOf(a) < 0)
				out.push(a);
			else
				out.push('-');
		
			continue;
		}
		
		out.push(f.letter);
	}
	var o = out.join('');
	this.score = this.calculateScore(o);

	return this.score;
};

Solution.prototype.setWord = function(codedWord, replacementWord) {
	var codedLetters = codedWord.extract();
	var replacementLetters = replacementWord.extract();
	
	for(var i=0; i<codedLetters.length; i++) 
		this.setLetter(codedLetters[i], replacementLetters[i], true);
	
	this.history.push(["Set Word: ", codedWord.word, "=>", replacementWord.word].join(''));
};

Solution.prototype.clearHistory = function(leave) {
	while(this.history.length > leave)
		this.history.shift();
};

Solution.prototype.setLetter = function(codedLetter, replacementLetter, ignoreHistory) {
	for(var i=this.matches.length - 1, x;x=this.matches[i];i--) {
		if(x.code == codedLetter || x.letter == replacementLetter)
			this.matches.splice(i, 1);
	}
	this.matches.push({
		code: codedLetter,
		letter: replacementLetter
	});
	if(ignoreHistory !== true)
		this.history.push(["Set Letter: ", codedLetter, "=>", replacementLetter].join(''));
};

Solution.prototype.calculateScore = function(decrypted) {
	var score = {
		decrypted: decrypted,
		score: 0,
		words: 0,
		letters: 0,
		found: []
	};
	
	var words = decrypted.split(' ')
		.map(function(x) { return x.trim(); });
	
	words.forEach(function(w) {
		w = w.split('').filter(function(x) { return Constants.alphabet.indexOf(x) >= 0; }).join('');
		
		if(score.found.indexOf(w) >= 0)
			return;
		
		var l = w.length.toString() + '_word';
		if(Constants.wordBank[l] && Constants.wordBank[l].indexOf(w) >= 0)
		{
			score.found.push(w);
			score.words += 1;
			score.letters += w.length;
		}
	});
	
	score.score = score.words / this.code.uniqueCount;
	return score;
};

Solution.prototype.fill = function() {

	var abc = this.getUnusedLetters();
	this.shuffle(abc);
	
	var codes = this.getUnusedCodes()
	
	for(var i=0, c; c = codes[i]; i++) {
		this.matches.push({
			letter: abc[i],
			code: c
		});
	}
};

Solution.prototype.getUnusedLetters = function() {
	var alreadyMatchedLetters = this.matches.map(function(x) { return x.letter; });
	return Constants.alphabet.filter(function(x) { return alreadyMatchedLetters.indexOf(x) < 0;  });
};
Solution.prototype.getUnusedCodes = function() {
	var alreadyMatchedCodes = this.matches.map(function(x) { return x.code; });
	
	return this.code.code.split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).filter(function(x) { return Constants.alphabet.indexOf(x) >= 0 && alreadyMatchedCodes.indexOf(x) < 0; });
};
Solution.prototype.getRandomMatch = function() {
	return this.matches[Math.floor(Math.random()*this.matches.length)];
};
Solution.prototype.getRandomWord = function() {
	return Constants.tenkWords[Math.floor(Math.random()*Constants.tenkWords.length)];
};
Solution.prototype.getTargettedWord = function(word) {
	var x = word.word.length;
	if(Constants.wordBank[x])
		return Constants.wordBank[x][Math.floor(Math.random()*Constants.wordBank[x].length)];

	return null;
};

Solution.prototype.clone = function() {
	return new Solution(
		JSON.parse(JSON.stringify(this.matches)), 
		this.code,
		JSON.parse(JSON.stringify(this.history))
		);
};

Solution.prototype.reproduce = function(numberOfChildren, //oddsOfLetterShift, 
	oddsOfRandomLetter, oddsOfWordHunt, mates) {
	var children = [];
	
	for(var i=0;i<numberOfChildren;i++) {
		var child;
		if(mates != null && mates.length > 0) {
			var mate = mates[Math.floor(Math.random() * mates.length)];
			child = this.mate(mate);
			mate.children.push(child);
		} else {
			child = this.clone();
		}
		
		this.children.push(child);
		
		var found = false;
		while(Math.random() < oddsOfWordHunt) {
			found += child.wordHunt();
		}
		
		child.mutate(oddsOfRandomLetter);
	
		children.push(child);
	}

	return children;
};

Solution.prototype.mate = function(partner)
{
	var solution = this.clone();

	for(var i=0, match; match = this.matches[i]; i++) {
		if(Math.random() > .5)
			if(partner.matches[i])
				solution.setLetter(partner.matches[i].code, partner.matches[i].letter, true);
	}
	
	solution.fill();
	
	/*function getS(s) {
		if(s.score && s.score.decrypted)
			return s.score.decrypted;
		
		return s.solve().decrypted;
	}*/
	
	solution.history.push(["Mated ", 
		this.getDna(), 
		//" (", getS(this), 
		//	") with ", 
		" with ",
		partner.getDna(), 
		//" (", getS(partner), 
		//")"
	].join(''));
	
	return solution;
};

Solution.prototype.getDna = function() {
	return this.matches.map(function(m) { return m.code; }).join('');
}

Solution.prototype.mutate = function(oddsOfRandomLetter) {
	var sentence = ['Set Letters: '];
	
	while(Math.random() <= oddsOfRandomLetter) {
		var abc = this.getUnusedLetters();
		this.shuffle(abc);
		var match = this.getRandomMatch();
		
		match.letter = abc[0];
		sentence.push(match.code);
		sentence.push('=>');
		sentence.push(match.letter);
		sentence.push(', ');
	}
	
	if(sentence.length == 1)
		return;

	sentence.pop();
	this.history.push(sentence.join(''));
};

Solution.prototype.wordHunt = function() {
	var randomWord = this.code.words[Math.floor(Math.random() * this.code.words.length)];
	
	var found = false;
	var iteration = 0;
	while(iteration++ < 3) {
		var targettedWord = this.getTargettedWord(randomWord);
		
		if(targettedWord && targettedWord.equals(randomWord))
		{
			this.setWord(randomWord, targettedWord);
			this.fill();
			
			return true;
		}
	}
	return false;
};

Solution.prototype.shuffle = function (a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
};

Solution.prototype.equals = function(other) {
	return this.score.decrypted == other.score.decrypted;
};