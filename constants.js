module.exports = {
	DoneButtonStyle: {
		FILL: 'fill',
		LINE: 'line'
	},
	TitleShortenRule: {
		FIRST_TWO: 'first_two', 	// First two letters of first word
		FIRST_JOIN: 'first_join',	// Join first letters of each words
		HYBRID: 'hybrid'			// Combine above rules. if # of words is less than 2, follow fist rule else second
	}
}