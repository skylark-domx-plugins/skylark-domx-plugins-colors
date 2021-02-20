define([
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins",
    "skylark-graphics-colors/Color",
    "./colors",
    "./helper"
],function(skylark, langx, browser, noder, finder, $,eventer, styler,fx,plugins,Color,colors,helper) {
    "use strict";

    var noop = langx.noop;

    var ColorPalette = plugins.Plugin.inherit({
        klassName : "ColorPalette",

        pluginName : "domx.colors.palette",

        options : {
            selectors  : {
            },

            texts : {
            },

            states : {
                showSelectionPalette: true
            },
            palette: [
                ["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]
            ],
            selectionPalette: []

        },

       _addColorToSelectionPalette : function (color) {
            if (this.stating("showSelectionPalette")) {
                var rgb = Color.parse(color).toRgbString();
                if (!this._paletteLookup[rgb] && langx.inArray(rgb, this._selectionPalette) === -1) {
                    this._selectionPalette.push(rgb);
                    while(this._selectionPalette.length > this._maxSelectionSize) {
                        this._selectionPalette.shift();
                    }
                }
            }
        },  

        getUniqueSelectionPalette : function () {
            var unique = [],
                opts = this.options;
            if (this.stating("showPalette")) {
                for (var i = 0; i < this._selectionPalette.length; i++) {
                    var rgb = Color.parse(this._selectionPalette[i]).toRgbString();

                    if (!this._paletteLookup[rgb]) {
                        unique.push(this._selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        },

        _drawPalette : function () {

            var opts = this.options,
                currentColor = this.current();

            var html = langx.map(this._paletteArray, function (palette, i) {
                return helper.paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            if (this._selectionPalette) {
                html.push(helper.paletteTemplate(this.getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
            }

            this.$el.html(html.join(""));
        },


        _updateUI : function () {
           this._drawPalette();
        },


        _applyOptions : function () {
            var opts = this.options;

            this._states = {
                showSelectionPalette: opts.showSelectionPalette
            };            

            if (opts.palette) {
                var  palette = this._palette = opts.palette.slice(0),
                    paletteArray = this._paletteArray = langx.isArray(palette[0]) ? palette : [palette],
                    paletteLookup = this._paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = Color.parse(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }
           this._applyStates();
        },

         _construct: function(elm, options) {
           plugins.Plugin.prototype._construct.call(this,elm,options);

            this.$el = this.$();

            this._init();
        },

        _init : function () {
            var self = this,
                opts = this.options,
                initialColor = this._initialColor =  opts.color,
                selectionPalette = this._selectionPalette =  opts.selectionPalette.slice(0);

            this._applyOptions();


            if (!!this._initialColor) {
                this.current(this._initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                self._addColorToSelectionPalette(this._initialColor);
            } else {
                this._updateUI();
            }

            function paletteElementClick(e) {
                self.current($(e.target).closest(".sp-thumb-el").data("color"));
                self.emit("selected",self.current());
                return false;
            }

            var paletteEvent = browser.isIE ? "mousedown.palette" : "click.palette touchstart.palette";
            this.$el.on(paletteEvent, ".sp-thumb-el", paletteElementClick);
        },


        _applyStates : function() {

        },

        stating : function(name,value) {
        	if (value !== undefined) {
        		this._states[name] = value;
        		this._applyStates();
        	} else {
        		return this._states[name];
        	}
        },

        reflow : function () {
           this._drawPalette();
        },

        current : function(color) {
        	if (color === undefined) {
        		return this._current;
        	} else {
        		this._current = color;
                this._updateUI();
        	}
        }

    });


    plugins.register(ColorPalette);

    return colors.ColorPalette = ColorPalette;

});