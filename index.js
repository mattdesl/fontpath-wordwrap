var tmpBounds = { x: 0, y: 0, width: 0, height: 0, glyphs: 0 };

function isWhitespace(chr) {
	return chr===' '
		|| chr==='\n'
		|| chr==='\r'
		|| chr==='\t';
}

function idxOf(text, chr, start, end) {
	var idx = text.indexOf(chr, start);
	if (idx === -1 || idx > end)
		return end;
	return idx;
}

function WordWrap(text) {
	/**
	 * The text being operated on.
	 * @param {String} text
	 */
	this.text = text||"";

	/**
	 * An array of lines representing the state of this word wrapper.
	 * @param {Array} lines
	 */
	this.lines = [];

	/** 
	 * The newline character to break on, default '\n'
	 * @param {String} newline
	 */
	this.newline = '\n';

	/**
	 * Whether to clip non-breaking text (nowrap and pre)
	 * if the wrapWidth is too small. 
	 *  
	 * @param {Boolean} clip
	 */
	this.clip = false;

	/**
	 * The mode for wordwrapping: 'pre', 'normal', or 'nowrap'.
	 *
	 * You can also use the `PRE`, `NORMAL`, and `NOWRAP` constants
	 * in `WordWrap.Mode`.
	 * 
	 * @param {String} mode
	 */
	this.mode = WordWrap.Mode.NORMAL;
}

WordWrap.Mode = {
	PRE: 'pre',       //whitespace isn't collapsed
	NORMAL: 'normal', //whitespace is collapsed
	NOWRAP: 'nowrap'  //only break on '\n'
};

/**
 * Clears any multi-line layout by placing all the text in a single Line object.
 * 
 * @param {GlyphIterator} iterator the iterator to use 
 * @method  clearLayout
 */
WordWrap.prototype.clearLayout = function(iterator) {
	this.lines.length = 0;
	
	if (this.text.length > 0) {
		iterator.getBounds(this.text, 0, this.text.length, undefined, tmpBounds);
		
		var line = new WordWrap.Line(0, this.text.length, tmpBounds.width);
		this.lines.push(line);
	}
};

/**
 * Resets the word wrapper by emptying all current lines.
 * @method  empty
 */
WordWrap.prototype.empty = function() {
	this.lines.length = 0;
};

/**
 * Word-wraps the given text into multiple lines.
 * @param  {[type]} iterator [description]
 * @param  {[type]} width    [description]
 * @param  {[type]} start    [description]
 * @param  {[type]} end      [description]
 * @return {[type]}          [description]
 */
WordWrap.prototype.layout = function(iterator, wrapWidth, start, end) {
	var text = this.text;

	var lines = this.lines;

	start = Math.max(0, start||0);
	end = (end===0||end) ? end : text.length;

	iterator.begin();

	//default wrap width...
	wrapWidth = (wrapWidth===0 || wrapWidth) ? wrapWidth : Number.MAX_VALUE;

	//<pre> mode just uses a simple algorithm...
	if (this.mode === WordWrap.Mode.PRE) {
		var lineStart = start;
		for (var i=start; i<end; i++) {
			var chr = text.charAt(i);

			//If we've reached a newline, then step down a line
			//Or if we've reached the EOF
			if ( chr === this.newline || i===end-1) {
				var availableWidth = this.clip ? wrapWidth : undefined;
				iterator.getBounds(text, lineStart, i+1, availableWidth, tmpBounds);
				lines.push( new WordWrap.Line(lineStart, lineStart+tmpBounds.glyphs, tmpBounds.width) );
				lineStart = i+1;
			}
		}
	} 
	//'normal' mode uses LibGDX's word wrapping algorithm:
	//https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
	else {
		//if 'nowrap' is specified, we only wrap on newline chars
		
		var testWidth = wrapWidth;
		if (this.mode === WordWrap.Mode.NOWRAP) {
			testWidth = Number.MAX_VALUE;
		}

		while (start < end) {
			//get next newline position
			var newLine = idxOf(text, this.newline, start, end);

			//eat whitespace at start of line
			while (start < newLine) {
				if (!isWhitespace( text.charAt(start) ))
					break;
				start++;
			}

			//determine visible # of glyphs for the available width
			iterator.getBounds(text, start, newLine, testWidth, tmpBounds)

			var lineEnd = start + tmpBounds.glyphs;
			var nextStart = lineEnd + this.newline.length;

			//if we had to cut the line before the next newline...
			if (lineEnd < newLine) {
				//find char to break on
				while (lineEnd > start) {
					if (isWhitespace(text.charAt(lineEnd)))
						break;
					lineEnd--;
				}
				if (lineEnd === start) {
					if (nextStart > start + this.newline.length) nextStart--;
					lineEnd = nextStart; // If no characters to break, show all.
				} else {
					nextStart = lineEnd;
					//eat whitespace at end of line
					while (lineEnd > start) {
						if (!isWhitespace(text.charAt(lineEnd - this.newline.length)))
							break;
						lineEnd--;
					}
				}
			}

			if (lineEnd > start) {
				//to clip, use the original wrap width (unaltered by mode)
				var availableWidth = this.clip ? wrapWidth : undefined;
				iterator.getBounds(text, start, lineEnd, availableWidth, tmpBounds);
				var lineWidth = tmpBounds.width;

				var rLineEnd = this.clip ? start+tmpBounds.glyphs : lineEnd;
				lines.push( new WordWrap.Line(start, rLineEnd, lineWidth) );
			}
			start = nextStart;

		}
	}

	iterator.end();
};

/**
 * A convenience method to return the maximum width of all current lines.
 * This is useful for aligning blocks of text.
 *
 * @method  getMaxLineWidth
 * @return {Number} the maximum width of all lines
 */
WordWrap.prototype.getMaxLineWidth = function() {
	var maxWidth = 0;
	for (var i=0; i<this.lines.length; i++) {
		var line = this.lines[i];
		maxWidth = Math.max(line.width, maxWidth);
	}
	return maxWidth;
};

/**
 * The Line object holds the start and end indices into the string,
 * and the width as computed by GlyphIterator.
 * 
 * @class  WordWrap.Line
 * @param {Number} start the start index, inclusive
 * @param {Number} end   the end index, exclusive
 * @param {Number} width the computed width of this line
 */
WordWrap.Line = function(start, end, width) {
	this.start = start;
	this.end = end;
	this.width = width;
};

module.exports = WordWrap;