var Constants = {};

Constants.byWordStartFrequency = [
	't', 'a', 's', 'h', 'w', 'i', 'o', 'b', 'm',
	'f', 'c', 'l', 'd', 'p', 'n', 'e', 'g', 'r',
	'y', 'u', 'v', 'j', 'k', 'q', 'z', 'x'
].map(function(x) { return x.toUpperCase() });
Constants.byLetterFrequency = [
	'E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 
	'D', 'L', 'U', 'C', 'M', 'F', 'Y', 'W', 'G', 
	'P', 'B', 'V', 'K', 'X', 'Q', 'J', 'Z'
];

Constants.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
