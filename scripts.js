//flow.js

var Flow = function(settings) {
	var DEFAULTS = {
		code: null,
		solutions: [],
		onCycleBegins: function(state) { },
		onCycleEnds: function(state) { },
		onStepBegins: function(newAncestors, index, state) { },
		onStepEnds: function(newAncestors, state) { },
		onStepEnds2: function(newAncestors, state) { },
		onVictory: function(state, best) { },
		onContinue: function(state, best) { },
		onComplete: function(state) { },
		mustBeatThisSpread: 10,
		maximumPopulation: 60,
		percentOfChildrenThatBypassSelection: .12,
		alphabet: Constants.alphabet,
		numberOfMates: 50,
		numberOfChildren: 100,
		timeout: 1,
		maxHistoryLength: 3
	};

	this.settings = $.extend({}, DEFAULTS, settings);
};

Flow.prototype.beginCycle = function(state)
{
	this.settings.onCycleBegins(state);
	
	var newAncestors = [];
	
	var self = this;
	setTimeout(function() {
		self.beginStep([], 0, state);
	}, this.settings.timeout);
};
Flow.prototype.beginStep = function(newAncestors, index, state)
{
	var self = this;
	this.settings.onStepBegins(newAncestors, index, state);
	
	var numberOfChildren = this.settings.numberOfChildren;
	
	state.ancestors.sort(function(a,b) { return b.score.words - a.score.words; });
	var ancestor = state.ancestors[index];
	
	var ancestorSubset = [];

	state.ancestors.forEach(function(a) {
		a.clearHistory(self.settings.maxHistoryLength);
	});
	
	// ~15% of the ancestors are the best performing, 
	// the next ~20% are randomly generated
	// the last % are randomly selected, possibly duplicates
	for(var i=0;i<this.settings.numberOfMates;i++) {
		if(i<Math.ceil(this.settings.numberOfMates/5) && state.ancestors[i])
			ancestorSubset.push(state.ancestors[i]);
		else if (i<Math.ceil(this.settings.numberOfMates+ .2)) {
			var sol = new Solution([], ancestor.code);
			var j=0;
			var found = 0;
			while(j++ < 10 && found < 2) { 
				found += sol.wordHunt();
			};
			sol.fill();
			ancestorSubset.push(sol);
		}else {
			ancestorSubset.push(state.ancestors[Math.floor(state.ancestors.length * Math.random())]);
		}
	}
	
	var children = ancestor.reproduce(
		numberOfChildren, // children
		//.7, // odds of letter exchange
		.8, // odds of random letter substitution
		.4, // odds of word hunt
		ancestorSubset //mates
		);
	
	children.forEach(function(c) {
		c.solve();
		state.mutations++;
	});
	
	children = children.filter(function(c) { return c.score.words >= state.best.score.words - self.settings.mustBeatThisSpread; });
	
	children.forEach(function(c) {
		newAncestors.push(c);
	});
	children = null;
	
	index++;
	
	var self = this;
	
	if(index == state.ancestors.length)
		setTimeout(function() {
			self.endStep(newAncestors, state);
		}, this.settings.timeout);
	else
		setTimeout(function() {
			self.beginStep(newAncestors, index, state);
		}, this.settings.timeout);
};
Flow.prototype.endStep = function(newAncestors, state)
{
	var self = this;
	this.settings.onStepEnds(newAncestors, state);
	
	if(newAncestors.length == 0)
	{
		return this.endCycle(state);
	}
	
	newAncestors.filter(function(c) { return c.score.words >= state.best.score.words - self.settings.mustBeatThisSpread; });
	
	// the top 1/4 of the group gets a spot
	newAncestors.sort(function(a,b) { return b.score.letters - a.score.letters; });
	
	delete state.ancestors;
	state.ancestors = newAncestors.splice(0, Math.ceil(self.settings.maximumPopulation  * self.settings.percentOfChildrenThatBypassSelection));
	
	// the remaining 3/4 is chosen at random with a bias towards better performing children
	while(state.ancestors.length < self.settings.maximumPopulation && newAncestors.length > 0)
	{
		var x = Math.floor(Math.random() * newAncestors.length);
		
		if(Math.random() < newAncestors[x].score.score)
			state.ancestors.push(newAncestors.splice(x, 1)[0]);
	}
	
	if(state.historicalScores == null)
		state.historicalScores = [];
	
	state.ancestors.sort(function(a,b) { return b.score.letters - a.score.letters; });
	//state.last = state.ancestors[0].score;
	state.best = state.ancestors[0];
	
	state.historicalScores.push({ 
		generation: state.generation, 
		highScore: state.ancestors[0].score.score,
		words: state.ancestors[0].score.words,
		population: state.ancestors.length,
		score: state.ancestors[0].score
	});
	
	this.settings.onStepEnds2(newAncestors, state);

	this.endCycle(state);

	delete newAncestors;
};

Flow.prototype.endCycle = function(state)
{
	state.generation++;
	this.settings.onCycleEnds(state);

	if(state.generation <= state.maxGeneration) {
		var best = state.ancestors.filter(function(x) { return x.score.score == 1; });
		if(best.length > 0) {
			this.settings.onVictory(state, best);
		}
		else {
			var self = this;
			setTimeout(function() {
				self.beginCycle(state);
			}, this.settings.timeout);
		}
	}
	else 
	{
		this.settings.onComplete(state);
	}	
};
