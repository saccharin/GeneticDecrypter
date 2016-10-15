function Solution(matches, code, history) {
	this.matches = matches;
	this.code = code;
	
	this.score = null;
	this.history = history || [];
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
	var s = this.calculateScore(o);
	
	this.score = {
		decrypted: o,
		score: s / this.code.words.length,
		words: s
	};
	return this.score;
};

Solution.prototype.setWord = function(codedWord, replacementWord) {
	var codedLetters = codedWord.extract();
	var replacementLetters = replacementWord.extract();
	
	for(var i=0; i<codedLetters.length; i++) 
		this.setLetter(codedLetters[i], replacementLetters[i], true);
	
	this.history.push("Set Word: " + codedWord.word + "=>" + replacementWord.word);
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
		this.history.push("Set Letter: " + codedLetter + "=>" + replacementLetter);
};

Solution.prototype.calculateScore = function(decrypted) {
	var score = 0;
	
	var words = decrypted.split(' ')
		.map(function(x) { return x.trim(); })
		.filter(function(x) { return x.length > 0; });
	
	words.forEach(function(w) {
		w = w.split('').filter(function(x) { return Constants.alphabet.indexOf(x) >= 0; }).join('');
		//log(w);
		if(Constants.tenk.indexOf(w) >= 0)
			score += 1;
	});
	
	return score;
};

Solution.prototype.fill = function() {

	var abc = this.getUnusedLetters();
	this.shuffle(abc);
	//log(abc);
	
	var codes = this.getUnusedCodes()
	//log(codes);
	
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

Solution.prototype.clone = function() {
	return new Solution(
		JSON.parse(JSON.stringify(this.matches)), 
		this.code,
		JSON.parse(JSON.stringify(this.history))
		);
};

Solution.prototype.reproduce = function(numberOfChildren, oddsOfLetterShift, oddsOfSwitch, mates) {
	var children = [];
	
	for(var i=0;i<numberOfChildren;i++) {
		var child;
		if(mates != null && mates.length > 0)
			child = this.mate(mates[Math.floor(Math.random() * mates.length)]);
		else
			child = this.clone();
		//var child = this.clone();
		
		if(Math.random() < .5) {
			var i=0;
			var found = false;
			while(i++ < 10 && found === false) { 
				found = child.wordHunt();
			};
		}
		else
			child.mutate(oddsOfLetterShift, oddsOfSwitch);
	
		children.push(child);
	}
	
	return children;
};

Solution.prototype.mate = function(partner)
{
	var solution = this.clone(); // new Solution([], this.code, this.history);
	for(var i=0, match; match = this.matches[i]; i++) {
		if(Math.random() > .5)
			solution.setLetter(partner.matches[i].code, partner.matches[i].letter, true);
	}
	
	solution.fill();
	
	solution.history.push("Mated " + this.matches.map(function(m) { return m.code; }).join('') + " with " + partner.matches.map(function(m) { return m.code; }).join(''));
	
	return solution;
};

Solution.prototype.mutate = function(oddsOfLetterShift, oddsOfSwitch) {
	// substitute an unused letter with a used one
	if(Math.random() <= oddsOfLetterShift) {
		var abc = this.getUnusedLetters();
		this.shuffle(abc);
		var match = this.getRandomMatch();
		
		this.history.push("Set Letter: " + match.letter + "=>" + abc[0]);
		//log(match.letter + ' => ' + abc[0]);
		match.letter = abc[0];
	}
	
	// switch 
	if(Math.random() <= oddsOfSwitch) {
		var m1 = this.getRandomMatch();
		var m2;
		
		while(m2 == null || m2 == m1)
			m2 = this.getRandomMatch();
		
		//log(m1.letter + ' <=> ' + m2.letter);
		
		var a1 = m1.letter;
		m1.letter = m2.letter;
		m2.letter = a1;
		
		this.history.push("Set Letter: " + m1.code + "=>" + m1.letter);
		this.history.push("Set Letter: " + m2.code + "=>" + m2.letter);
	}
};

Solution.prototype.wordHunt = function() {
	var wrd= this.getRandomWord();
	
	for(var i=0, w; w=this.code.words[i];i++) {
		if(w.equals(wrd)) {
			this.setWord(w, wrd);
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
	/*
	// http://stackoverflow.com/a/16436975/1451957
	if (this.matches === other.matches) return true;
	if (this.matches == null || other.matches == null) return false;
	if (this.matches.length != other.matches.length) return false;
	
	var self= this;
	
	var am = JSON.parse(JSON.stringify(this.matches));
	am.filter(function(a) { return self.code.letters.indexOf(a) >= 0; });
	am.sort(function(a,b) { return a.letter - b.letter; });
	
	var om = JSON.parse(JSON.stringify(other.matches));
	om.filter(function(a) { return self.code.letters.indexOf(a) >= 0; });
	om.sort(function(a,b) { return a.letter - b.letter; });
	
	for (var i = 0; i < am.length; ++i) {
		if (am[i].code !== om[i].code
			|| am[i].letter !== om[i].letter
		) return false;
	}
	return true;
	*/
};