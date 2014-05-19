A basic greedy word-wrapper based on LibGDX bitmap font rendering. Uses [fontpath-glyph-iterator](https://github.com/mattdesl/fontpath-glyph-iterator) to lay out the glyphs and determine their visible widths. 

# usage

```js
var WordWrap = require('fontpath-wordwrap');
var GlyphIterator = require('fontpath-glyph-iterator');

//setup a glyph iterator for your font
var iterator = new GlyphIterator(MyFont, fontSize);

//create a new word wrapper...
var wrap = new WordWrap();

//Lay out some text to a given width
wrap.text = myLongString;
wrap.layout( iterator, wrapWidth );

//this is an array of WordWrap.Line objects, 
//with start/end indices into myLongString
console.log( wrap.lines );
```

# members

### `wrap.text`
The string to process. 

### `wrap.lines`
An array of `WordWrap.Line` objects, which holds `{ start, end, width }`. `width` is the computed width of the line.

### `wrap.empty()`
Clears the current list of lines. 

### `wrap.layout( glyphIterator, wrapWidth, start, end )`
Lays out the currently set `text` instance variable, using the specified glyph iterator, an option wrap width (default to infinity), and optional start (inclusive) and end (exclusive) indices into the string. Start defaults to zero, end defaults to the string length.

This will add new Line objects onto the stack; so you may want to `empty()` the lines before laying out the text.

### `wrap.clearLayout( glyphIterator )`
Clears the `lines` array to zero. Then, if the current text is not empty, a single Line will be added for the entire string (i.e. no word-wrapping or line breaking).

### `wrap.mode`

Wordwrap mode, a string. Default `normal`. One of:

- `WordWrap.Mode.NORMAL` or `"normal"` - wraps to a specified width, breaks on newlines, and collapses whitespace 
- `WordWrap.Mode.PRE` or `"pre"` - preserves whitespace, breaks on newlines
- `WordWrap.Mode.NOWRAP` or `"nowrap"` - breaks on newlines and collapses whitespace, otherwise doesn't break

### `wrap.getMaxLineWidth()`

A convenience method to return the maximum width of all current lines. Useful for text alignment.

### `wrap.clip`

A boolean (default false) that specifies whether to "clip" the glyphs to the specified wrapWidth, to avoid them overflowing out of the desired text box. This only applies to `pre` and `nowrap` modes.

# example

See [fontpath-canvas](https://github.com/mattdesl/fontpath-canvas) for a more complete implementation of this word-wrapper. 

The following screenshot shows a single string which has been layed out with two different modes: 'normal' (first paragraph), and 'pre' (second paragraph). The gray border shows the wrap width being used. This text was rendered with paths in 2D Canvas.

![Output](http://i.imgur.com/jgLZl64.png)

Here is the same string, with `clip` enabled and a smaller `wrapWidth`.

![Out2](http://i.imgur.com/bSE94lQ.png)

# Roadmap

Eventually I hope to add basic styling support. For now, this only wraps text that all contain the same styling. Adding styles will likely lead to API breakage.