//flow.js

// Potential Change: imitate life cycle:
//	Spring: survivors emerge
//	Summer: reproduce
//	Fall: get scores of all children
//	Winter: cull the weak

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
		mustBeatThisSpread: 2,
		maximumNumberOfAncestors: 15,
		alphabet: Constants.alphabet,
		numberOfMates: 10,
		numberOfChildren: 15,
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
	}, 100);
};
Flow.prototype.beginStep = function(newAncestors, index, state)
{
	this.settings.onStepBegins(newAncestors, index, state);
	
	var numberOfChildren = this.settings.numberOfChildren;
	
	state.ancestors.sort(function(a,b) { return b.score.words - a.score.words; });
	var ancestor = state.ancestors[index];
	
	var ancestorSubset = [];
	
	// ~40% of the ancestors are the best performing, 
	// the next ~30% are randomly selected, possibly duplicates
	// the last ~30% are randomly generated
	for(var i=0;i<numberOfChildren;i++) {
		if(i<Math.ceil(numberOfChildren/3) && state.ancestors[i])
			ancestorSubset.push(state.ancestors[i]);
		else if (i<Math.ceil(numberOfChildren * 2/3))
			ancestorSubset.push(state.ancestors[Math.floor(state.ancestors.length * Math.random())]);
		else {
			var sol = new Solution([], ancestor.code);
			var j=0;
			var found = 0;
			while(j++ < 10 && found < 2) { 
				found += sol.wordHunt();
			};
			sol.fill();
			ancestorSubset.push(sol);
		}
	}
	
	var children = ancestor.reproduce(
		numberOfChildren, // children
		.5, // odds of letter replacement
		.5, // odds of letter switch
		ancestorSubset //mates
		);
	
	children.forEach(function(c) {
		c.solve();
		state.mutations++;
	});
	
	children = children.filter(function(c) { return c.score.words >= state.last.words - 1; });
	
	children.forEach(function(c) {
		newAncestors.push(c);
	});
	children = null;
	
	index++;
	
	var self = this;
	
	if(index == state.ancestors.length)
		setTimeout(function() {
			self.endStep(newAncestors, state);
		}, 100);
	else
		setTimeout(function() {
			self.beginStep(newAncestors, index, state);
		}, 100);
};
Flow.prototype.endStep = function(newAncestors, state)
{
	var self = this;
	this.settings.onStepEnds(newAncestors, state);
	
	newAncestors.sort(function(a,b) { return b.score.words - a.score.words; });
	
	if(newAncestors.length == 0)
	{
		return this.endCycle(state);
	}
	
	state.last = newAncestors[0].score;
	newAncestors.filter(function(c) { return c.score.words >= state.last.words - self.settings.mustBeatThisSpread; });
	
	if(newAncestors.length > this.settings.maximumNumberOfAncestors)
		newAncestors.length = this.settings.maximumNumberOfAncestors;
	
	state.ancestors = [];
	for(var i=newAncestors.length - 1;i>=0;i--) {
		state.ancestors.push(newAncestors.pop(i));
	}
	
	for(var i=state.ancestors.length - 1, a1; a1=state.ancestors[i]; i--) {
		for(var j=i-1, a2; a2=state.ancestors[j];j--) {
			if(a2.equals(a1)) {
				state.ancestors.splice(i, 1);
				break;
			}
		}
	}

	this.settings.onStepEnds2(newAncestors, state);

	this.endCycle(state);
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
			}, 100);
		}
	}
	else 
	{
		this.settings.onComplete(state);
	}	
};
