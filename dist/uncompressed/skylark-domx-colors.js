/**
 * skylark-domx-colors - The skylark dom api extenstion library for color
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx/skylark-domx-colors/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-domx-colors/colors',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("domx.colores",{});
});
define('skylark-domx-colors/helper',[
    "skylark-domx-browser",
    "skylark-domx-query",
    "skylark-graphics-color"    
],function(browser,$,Color){
    function paletteElementClick(e) {
        if (e.data && e.data.ignore) {
            self.set($(e.target).closest(".sp-thumb-el").data("color"));
            move();
        }
        else {
            self.set($(e.target).closest(".sp-thumb-el").data("color"));
            move();

            // If the picker is going to close immediately, a palette selection
            // is a change.  Otherwise, it's a move only.
            if (opts.hideAfterPaletteSelect) {
                self_updateOriginalInput(true);
                self.hide();
            } else {
                self._updateOriginalInput();
            }
        }

        return false;
    }

    var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";	

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = Color.parse(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (Color.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = "background-color:" + tiny.toRgbString();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.texts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    return {
    	paletteTemplate
    }
});

define('skylark-domx-colors/Indicator',[
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-plugins"    
],function(skylark, langx, browser, noder, eventer,finder, $,plugins) {
    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (browser.isIE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            var onstart = this.options.onstart || funcs.noop;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).on(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).off(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).on("touchstart mousedown", start);
    }
	

    var Indicator = plugins.Plugin.inherit({
        klassName : "Indicator",

        pluginName : "domx.indicator",

        options : {
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            this.listenTo(this.elmx(),"mousedown" , (e) => {
                this._start(e);
            });

        },

        _move : function(e) {
            if (this._dragging) {
                var offset = this._offset,
                    pageX = e.pageX,
                    pageY = e.pageY,
                    maxWidth = this._maxWidth,
                    maxHeight = this._maxHeight;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                var onmove = this.options.onmove;
                if (onmove) {
                    onmove.apply(this._elm, [dragX, dragY, e]);
                }
            }
        },

        _start : function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !this._dragging) {
                var onstart = this.options.onstart;
                if (!onstart || onstart.apply(this._elm, arguments) !== false) {
                    this._dragging = true;
                    var $el = this.$();

                    this._maxHeight = $el.height();
                    this._maxWidth = $el.width();
                    this._offset = $el.offset();

                    var $doc = this.$(document)

                    this.listenTo($doc,{
                        "mousemove" : (e) => {
                            this._move(e);
                        },
                        "mouseup" : (e) => {
                            this._stop(e);
                        }                
                    });
                    $doc.find("body").addClass("sp-dragging");

                    this._move(e);

                    eventer.stop(e);
                }
            }
        },

        _stop : function(e) {
            var $doc = this.$(document);
            if (this._dragging) {
                this.unlistenTo($doc);
                $doc.find("body").removeClass("sp-dragging");

                onstop = this.options.onstop;

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                if (onstop) {
                    this._delay(function() {
                        onstop.apply(this._elm, arguments);
                    });
                }
            }
            this._dragging = false;            
        }
    });

    plugins.register(Indicator);

	return Indicator;
});
define('skylark-domx-colors/ColorPicker',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins",
    "skylark-graphics-color",
    "./colors",
    "./helper",
    "./Indicator"
],function(langx, browser, noder, finder, $,eventer, styler,plugins,Color,colors,helper,Indicator) {
    "use strict";

    var ColorPicker = plugins.Plugin.inherit({
        klassName : "ColorPicker",

        pluginName : "domx.colors.picker",

        options : {
            selectors  : {
                dragger : ".sp-color",
                dragHelper : ".sp-dragger",
                slider : ".sp-hue",
                slideHelper : ".sp-slider",
                alphaSliderInner : ".sp-alpha-inner",
                alphaSlider : ".sp-alpha",
                alphaSlideHelper : ".sp-alpha-handle",
                textInput : ".sp-input",
                initialColorContainer : ".sp-initial",
                cancelButton : ".sp-cancel",
                clearButton : ".sp-clear",
                chooseButton : ".sp-choose"
            },

            draggingClass : "sp-dragging",

            texts : {
                cancelText: "cancel",
                chooseText: "choose",
                clearText: "Clear Color Selection",
                noColorSelectedText: "No Color Selected"
            },

            states : {
                showInput: false,
                allowEmpty: false,
                showButtons: true,
                showInitial: false,
                showAlpha: false
            },

            // Options
            color: false
        },
        
        _drawInitial : function () {
            var opts = this.options;
            if (this.stating("showInitial")) {
                var initial = this._initialColor;
                var current = this.get();
                this.$initialColorContainer.html(
                    helper.paletteTemplate([initial, current], current, "sp-palette-row-initial", opts)
                );
            }
        },

        _updateHelperLocations : function () {
            var s = this._currentSaturation;
            var v = this._currentValue;

            if(this.stating("allowEmpty") && this._isEmpty) {
                //if selected color is empty, hide the helpers
                this.$alphaSlideHelper.hide();
                this.$slideHelper.hide();
                this.$dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                this.$alphaSlideHelper.show();
                this.$slideHelper.show();
                this.$dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * this._dragWidth;
                var dragY = this._dragHeight - (v * this._dragHeight);
                dragX = Math.max(
                    -this._dragHelperHeight,
                    Math.min(this._dragWidth - this._dragHelperHeight, dragX - this._dragHelperHeight)
                );
                dragY = Math.max(
                    -this._dragHelperHeight,
                    Math.min(this._dragHeight - this._dragHelperHeight, dragY - this._dragHelperHeight)
                );
                this.$dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = this._currentAlpha * this._alphaWidth;
                this.$alphaSlideHelper.css({
                    "left": (alphaX - (this._alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (this._currentHue) * this._slideHeight;
                this.$slideHelper.css({
                    "top": (slideY - this._slideHelperHeight) + "px"
                });
            }
        },

        _updateOriginalInput : function (fireCallback) {
            var color = this.get(),
                displayColor = '',
                hasChanged = !Color.equals(color, this._colorOnShow);

            if (color) {
                displayColor = color.toString(this._currentPreferredFormat);
                // Update the selection palette with the current color
                this._addColorToSelectionPalette(color);
            }

            if (this._isInput) {
                this.$el.val(displayColor);
            }

            if (fireCallback && hasChanged) {
                //callbacks.change(color);
                //this.$el.trigger('change', [ color ]);
            }
        },

        _updateUI : function () {
            var opts = this.options;

            this._dragWidth = this.$dragger.width();
            this._dragHeight = this.$dragger.height();
            this._dragHelperHeight = this.$dragHelper.height();
            this._slideWidth = this.$slider.width();
            this._slideHeight = this.$slider.height();
            this._slideHelperHeight = this.$slideHelper.height();
            this._alphaWidth = this.$alphaSlider.width();
            this._alphaSlideHelperWidth = this.$alphaSlideHelper.width();
            
            this.$textInput.removeClass("sp-validation-error");

            this._updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            //var flatColor = Color.fromRatio({ h: currentHue, s: 1, v: 1 });
            var flatColor = Color.parse({ 
                h: this._currentHue * 360, 
                s: 1, 
                v: 1 
            });
            this.$dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = this._currentPreferredFormat;
            if (this._currentAlpha < 1 && !(this._currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = this.get({ format: format }),
                displayColor = '';

            if (!realColor && this.stating("allowEmpty")) {
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                if (this.stating("showAlpha")) {
                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = Color.parse(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (browser.isIE) {
                        this.$alphaSliderInner.css("filter", Color.parse(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        this.$alphaSliderInner.css("background", "-webkit-" + gradient);
                        this.$alphaSliderInner.css("background", "-moz-" + gradient);
                        this.$alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        this.$alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (this.stating("showInput")) {
                this.$textInput.val(displayColor);
            }

            if (this.stating("showPalette")) {
                this._drawPalette();
            }

            this._drawInitial();
        },


        _applyOptions : function () {
            var opts = this.options;

            this._states = {
                allowEmpty : opts.states.allowEmpty,
                showInput : opts.states.showInput,
                showAlpha : opts.states.showAlpha,
                showButtons : opts.states.showButtons,
                showInitial : opts.states.showInitial
            };


           this._applyStates();

           this.reflow();
        },

         _construct: function(elm, options) {
            this.overrided(elm,options);

            var $el = this.$el = this.$();

            var opts = this.options,
                theme = opts.theme;



            var                
                dragger = this.$dragger = $el.find(opts.selectors.dragger),
                dragHelper = this.$dragHelper = $el.find(opts.selectors.dragHelper),
                slider = this.$slider = $el.find(opts.selectors.slider),
                slideHelper = this.$slideHelper =  $el.find(opts.selectors.slideHelper),
                alphaSliderInner = this.$alphaSliderInner = $el.find(opts.selectors.alphaSliderInner),
                alphaSlider = this.$alphaSlider = $el.find(opts.selectors.alphaSlider),
                alphaSlideHelper = this.$alphaSlideHelper = $el.find(opts.selectors.alphaSlideHelper),
                textInput = this.$textInput = $el.find(opts.selectors.textInput),
                initialColorContainer = this.$initialColorContainer = $el.find(opts.selectors.initialColorContainer),
                cancelButton = this.$cancelButton = $el.find(opts.selectors.cancelButton),
                clearButton = this.$clearButton = $el.find(opts.selectors.clearButton),
                chooseButton = this.$chooseButton = $el.find(opts.selectors.chooseButton),
                initialColor = this._initialColor =  opts.color,
                currentPreferredFormat = this._currentPreferredFormat = opts.preferredFormat,
                isEmpty = this._isEmpty =  !initialColor;


            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;
             function dragStart() {
                if (self._dragHeight <= 0 || self._dragWidth <= 0 || self._slideHeight <= 0) {
                    self.reflow();
                }
                self._isDragging = true;
                self.$el.addClass(self.options.draggingClass);
                self._shiftMovementDirection = null;
                //this.$el.trigger('dragstart.ColorPicker', [ get() ]);
            }

            function dragStop() {
                self._isDragging = false;
                self.$el.removeClass(self.options.draggingClass);
                //this.$el.trigger('dragstop.ColorPicker', [ get() ]);
            }           

            function move() {
                self._updateUI();

                //callbacks.move(get());
                //this.$el.trigger('move.ColorPicker', [ get() ]);
            }

            this._applyOptions();

            function setFromTextInput() {
                var value = textInput.val();

                if ((value === null || value === "") && self._allowEmpty) {
                    self.set(null);
                    move();
                    self._updateOriginalInput();
                }
                else {
                    var tiny = Color.parse(value);
                    if (tiny.isValid()) {
                        self.set(tiny);
                        move();
                        self._updateOriginalInput();
                    }
                    else {
                        self.$textInput.addClass("sp-validation-error");
                    }
                }
            }
            this.$textInput.change(setFromTextInput);
            this.$textInput.on("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            this.$textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            this.$cancelButton.text(opts.texts.cancelText);
            
            this.listenTo(this.$cancelButton,"click", function (e) {
                eventer.stop(e);
                self.revert();
                self.hide();
            });

            this.$clearButton.attr("title", opts.texts.clearText);
            this.listenTo(this.$clearButton,"click", function (e) {
                //e.stopPropagation();
                //e.preventDefault();
                eventer.stop(e);
                self._isEmpty = true;
                move();

                if(opts.flat) {
                    //for the flat style, this is a change event
                    self._updateOriginalInput(true);
                }
            });

            this.$chooseButton.text(opts.texts.chooseText);
            this.listenTo(this.$chooseButton,"click", function (e) {
                eventer.stop(e);

                self._updateOriginalInput(true);
                self.hide();
            });
          
            this.$alphaSlider.plugin("domx.indicator", {
                "onmove" :   function (dragX, dragY, e) {
                    self._currentAlpha = (dragX / self._alphaWidth);
                    self._isEmpty = false;
                    if (e.shiftKey) {
                        self._currentAlpha = Math.round(self._currentAlpha * 10) / 10;
                    }

                    move();
                }, 
                "onstart" : dragStart, 
                "onstop" :dragStop
            });

            this.$slider.plugin("domx.indicator", {
                "onmove" :   function (dragX, dragY, e) {
                    self._currentHue = parseFloat(dragY / self._slideHeight);
                    self._isEmpty = false;
                    if (!self.stating("showAlpha")) {
                        self._currentAlpha = 1;
                    }
                    move();
                }, 
                "onstart" : dragStart, 
                "onstop" :dragStop
            });

            this.$dragger.plugin("domx.indicator", {
                "onmove" :   function (dragX, dragY, e) {

                    // shift+drag should snap the movement to either the x or y axis.
                    if (!e.shiftKey) {
                        self._shiftMovementDirection = null;
                    }
                    else if (!self._shiftMovementDirection) {
                        var oldDragX = self._currentSaturation * self._dragWidth;
                        var oldDragY = self._dragHeight - (self._currentValue * self._dragHeight);
                        var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                        self._shiftMovementDirection = furtherFromX ? "x" : "y";
                    }

                    var setSaturation = !self._shiftMovementDirection || self._shiftMovementDirection === "x";
                    var setValue = !self._shiftMovementDirection || self._shiftMovementDirection === "y";

                    if (setSaturation) {
                        self._currentSaturation = parseFloat(dragX / self._dragWidth);
                    }
                    if (setValue) {
                        self._currentValue = parseFloat((self._dragHeight - dragY) / self._dragHeight);
                    }

                    self._isEmpty = false;
                    if (!self.stating("showAlpha")) {
                        self._currentAlpha = 1;
                    }

                    move();
                }, 
                "onstart" : dragStart, 
                "onstop" :dragStop
            });

            if (!!this._initialColor) {
                this.set(this._initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                self._updateUI();
                this._currentPreferredFormat = opts.preferredFormat || Color.parse(this._initialColor).format;
            } else {
                this._updateUI();
            }

            function paletteElementClick(e) {
                if (e.data && e.data.ignore) {
                    self.set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }
                else {
                    self.set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();

                    // If the picker is going to close immediately, a palette selection
                    // is a change.  Otherwise, it's a move only.
                    if (opts.hideAfterPaletteSelect) {
                        self_updateOriginalInput(true);
                        self.hide();
                    } else {
                        self._updateOriginalInput();
                    }
                }

                return false;
            }

            var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";
            this.$initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
        },

        revert :  function () {
            this.set(this._initialColor, true);
            this._updateOriginalInput(true);
        },


        get : function (opts) {
            opts = opts || { };

            if (this._allowEmpty && this._isEmpty) {
                return null;
            }

            /*
            return fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 1000) / 1000
            }, { format: opts.format || currentPreferredFormat });
            */
            return Color.parse({
                h: this._currentHue * 360,
                s: this._currentSaturation,
                v: this._currentValue,
                a: Math.round(this._currentAlpha * 1000) / 1000
            });
        },


        set : function (color, ignoreFormatChange) {
            var opts = this.options;

            if (Color.equals(color, this.get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                this._updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && this.stating("allowEmpty")) {
                this._isEmpty = true;
            } else {
                this._isEmpty = false;
                newColor = Color.parse(color);
                newHsv = newColor.toHsv();

                this._currentHue = (newHsv.h % 360) / 360;
                this._currentSaturation = newHsv.s;
                this._currentValue = newHsv.v;
                this._currentAlpha = newHsv.a;
            }
            this._updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                this._currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
            }
        },

        _applyStates : function() {
           var states = this._states ;

            this.$el.toggleClass("sp-input-disabled", !states.showInput)
                        .toggleClass("sp-clear-enabled", !!states.allowEmpty)
                        .toggleClass("sp-alpha-enabled", states.showAlpha)
                        .toggleClass("sp-buttons-disabled", !states.showButtons)
                        .toggleClass("sp-initial-disabled", !states.showInitial);

            if (!states.allowEmpty) {
                this.$clearButton.hide();
            }

            this._dragWidth = this.$dragger.width();
            this._dragHeight = this.$dragger.height();
            this._dragHelperHeight = this.$dragHelper.height();
            this._slideWidth = this.$slider.width();
            this._slideHeight = this.$slider.height();
            this._slideHelperHeight = this.$slideHelper.height();
            this._alphaWidth = this.$alphaSlider.width();
            this._alphaSlideHelperWidth = this.$alphaSlideHelper.width();
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

            this._updateHelperLocations();

        }

    });


    plugins.register(ColorPicker);


    return colors.ColorPicker = ColorPicker;

});
define('skylark-domx-colors/ColorPalette',[
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
    "skylark-graphics-color",
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
           this.reflow();
        },

         _construct: function(elm, options) {
            this.overrided(elm,options);

            this.$el = this.$();

            var opts = this.options,
                initialColor = this._initialColor =  opts.color,
                selectionPalette = this._selectionPalette =  opts.selectionPalette.slice(0);

            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;
            this._applyOptions();


            if (!!this._initialColor) {
                this.current(this._initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                self._updateUI();
                this._currentPreferredFormat = opts.preferredFormat || Color.parse(this._initialColor).format;

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
        	}
        }

    });


    plugins.register(ColorPalette);

    return colors.ColorPalette = ColorPalette;

});
define('skylark-domx-colors/ColorPane',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins",
    "skylark-domx-popups",
    "skylark-graphics-color",
    "./colors",
    "./ColorPicker",
    "./ColorPalette"
],function(langx, browser, noder, finder, $,eventer, styler,fx,plugins,popups,Color,colors,ColorPicker,ColorPalette) {
    "use strict";

    var ColorPane = plugins.Plugin.inherit({
        klassName : "ColorPane",

        pluginName : "domx.colors.pane",

        options : {
            selectors  : {
                pickerContainer : ".sp-picker-container",
                toggleButton : ".sp-palette-toggle",
                paletteContainer : ".sp-palette"
            },

            draggingClass : "sp-dragging",           

            texts : {
                togglePaletteMoreText: "more",
                togglePaletteLessText: "less",
                clearText: "Clear Color Selection",
                noColorSelectedText: "No Color Selected"
            },

            states : {
                showPalette: false,
                showPaletteOnly: false,
                togglePaletteOnly: false,
                showSelectionPalette: true,
                showInput: false,
                allowEmpty: false,
                showButtons: true,
                showInitial: false,
                showAlpha: false
            },

            // Options
            color: false,
            maxSelectionSize: 7

        },

        _updateUI : function () {
            var realColor = this.get(),
                displayColor = '';
             //reset background info for preview element
            ///this.$previewElement.removeClass("sp-clear-display");
            ///this.$previewElement.css('background-color', 'transparent');

            ///if (!realColor && this.stating("allowEmpty")) {
            ///    // Update the replaced elements background with icon indicating no color selection
            ///    this.$previewElement.addClass("sp-clear-display");
            ///}
            ///else {
            ///    var realHex = realColor.toHexString(),
            ///        realRgb = realColor.toRgbString();

            ///    // Update the replaced elements background color (with actual selected color)
            ///    this.$previewElement.css("background-color", realRgb);

            ///    displayColor = realColor.toString();
            ///}

            if (this.stating("showPalette")) {
                this.palette._updateUI();
            }
            this.picker._updateUI();
        },


        _applyOptions : function () {
            var opts = this.options;

            this._states = {
                allowEmpty : opts.states.allowEmpty,
                showInput : opts.states.showInput,
                showAlpha : opts.states.showAlpha,
                showButtons : opts.states.showButtons,
                togglePaletteOnly : opts.states.togglePaletteOnly,
                showPalette : opts.states.showPalette,
                showPaletteOnly : opts.states.showPaletteOnly,
                showSelectionPalette: opts.showSelectionPalette,
                showInitial : opts.states.showInitial
            };

            //this.$container.toggleClass("sp-flat", opts.flat)
            //                .addClass(opts.containerClassName);

           this._applyStates();

           this.reflow();
        },

         _construct: function(elm, options) {
            this.overrided(elm,options);

            var $el = this.$el = this.$();

            var opts = this.options,
                theme = opts.theme;


            var 
                //container = this.$container = $(markup,elm.ownerDocument).addClass(theme),
                pickerContainer = this.$pickerContainer =  $el.find(opts.selectors.pickerContainer),
                paletteContainer = this.$paletteContainer =  $el.find(opts.selectors.paletteContainer),
                toggleButton = this.$toggleButton = $el.find(opts.selectors.toggleButton),
                //isInput = this._isInput = this.$el.is("input"),
                //isInputTypeColor = isInput && this.$el.attr("type") === "color",
                //shouldReplace = this._shouldReplace =  isInput && !opts.flat,
                //replacer = this.$replacer =  (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
                //offsetElement = this.$offsetElement =  (shouldReplace) ? replacer : this.$el,
                // previewElement = this.$previewElement = replacer.find(".sp-preview-inner"),
                // initialColor = this._initialColor =  opts.color || (isInput && this.$el.val()),
                initialColor = this._initialColor =  opts.color,
                isEmpty = this._isEmpty =  !initialColor;

            if (paletteContainer[0]) {
                this.palette = ColorPalette.instantiate(paletteContainer[0],{
                    selectionPalette : opts.selectionPalette,
                    color : opts.color,
                    palette : opts.palette,
                    selectionPalette : opts.selectionPalette
                })
            } 

            if (pickerContainer[0]) {
                this.picker = ColorPicker.instantiate(pickerContainer[0],{
                    color : opts.color,
                    states : {
                        showInput: opts.states.showInput,
                        allowEmpty: opts.states.allowEmpty,
                        showButtons: opts.states.showButtons,
                        showInitial: opts.states.showInitial,
                        showAlpha: opts.states.showAlpha                                            
                    }
                })               
            }
            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;
           if (browser.isIE) {
                this.$container.find("*:not(input)").attr("unselectable", "on");
            }

            ///if (this._shouldReplace) {
            ///    this.$el.after(this.$replacer).hide();
            ///}


            ///if (opts.flat) {
            ///    this.$el.after(this.$container).hide();
            ///} else {
            ///    var appendTo = opts.appendTo === "parent" ? this.$el.parent() : $(opts.appendTo);
            ///    if (appendTo.length !== 1) {
            ///        appendTo = $("body");
            ///    }

            ///    appendTo.append(this.$container);
            ///}

            this._applyOptions();

            ///this.listenTo(this.$offsetElement,"click touchstart", function (e) {
            ///    //if (!disabled) {
            ///        self.toggle();
            ///    //}

            ///    e.stopPropagation();

            ///    if (!$(e.target).is("input")) {
            ///        e.preventDefault();
            ///    }
            ///});

          
            this.listenTo(this.$toggleButton,"click", function (e) {
                //e.stopPropagation();
                //e.preventDefault();
                eventer.stop(e);

                ///self._states.showPaletteOnly = !self._states.showPaletteOnly;

                // To make sure the Picker area is drawn on the right, next to the
                // Palette area (and not below the palette), first move the Palette
                // to the left to make space for the picker, plus 5px extra.
                // The 'applyOptions' function puts the whole container back into place
                // and takes care of the button-text and the sp-palette-only CSS class.
                /*
                if (!self._states.showPaletteOnly && !opts.flat) {
                    self.$container.css('left', '-=' + (self.$pickerContainer.outerWidth(true) + 5));
                }
                */
                self.stating("showPaletteOnly",!self.stating("showPaletteOnly"));
                //self._applyOptions();
            });

            if (!!this._initialColor) {
                this.set(this._initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                self._updateUI();
                //this._currentPreferredFormat = opts.preferredFormat || Color.parse(this._initialColor).format;

                //self._addColorToSelectionPalette(this._initialColor);
            } else {
                this._updateUI();
            }

            if (opts.flat) {
                this.show();
            }

        },

        revert :  function () {
            this.set(this._colorOnShow, true);
            this._updateOriginalInput(true);
        },


        get : function (opts) {
            opts = opts || { };

            if (this._allowEmpty && this._isEmpty) {
                return null;
            }

            /*
            return fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 1000) / 1000
            }, { format: opts.format || currentPreferredFormat });
            */
            return Color.parse({
                h: this._currentHue * 360,
                s: this._currentSaturation,
                v: this._currentValue,
                a: Math.round(this._currentAlpha * 1000) / 1000
            });
        },


        set : function (color, ignoreFormatChange) {
            var opts = this.options;

            if (Color.equals(color, this.get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                this._updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && this.stating("allowEmpty")) {
                this._isEmpty = true;
            } else {
                this._isEmpty = false;
                newColor = Color.parse(color);
                newHsv = newColor.toHsv();

                this._currentHue = (newHsv.h % 360) / 360;
                this._currentSaturation = newHsv.s;
                this._currentValue = newHsv.v;
                this._currentAlpha = newHsv.a;
            }
            this._updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                this._currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
            }
        },

        _applyStates : function() {
           var states = this._states ;

            if (states.showPaletteOnly) {
                states.showPalette = true;
            }

            this.$toggleButton.text(states.showPaletteOnly ? this.option("texts.togglePaletteMoreText"): this.option("texts.togglePaletteLessText"));


            this.$el.toggleClass("sp-input-disabled", !states.showInput)
                            .toggleClass("sp-clear-enabled", !!states.allowEmpty)
                            .toggleClass("sp-alpha-enabled", states.showAlpha)
                            .toggleClass("sp-buttons-disabled", !states.showButtons)
                            .toggleClass("sp-palette-buttons-disabled", !states.togglePaletteOnly)
                            .toggleClass("sp-palette-disabled", !states.showPalette)
                            .toggleClass("sp-palette-only", states.showPaletteOnly)
                            .toggleClass("sp-initial-disabled", !states.showInitial);

            if (states.showPaletteOnly && !this.option("flat")) {
                this.$el.css('left', '-=' + (this.$pickerContainer.outerWidth(true) + 5));
            }
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

            ///if (!this.option("flat")) {
            ///   this.$container.css("position", "absolute");
            ///    var offset = this.option("offset"); 
            ///    if (offset) {
            ///        this.$container.offset(offset);
            ///    } else {
            ///        this.$container.offset(popups.calcOffset(this.$container[0], this.$offsetElement[0]));
            ///    }
            ///}

            if (this.stating("showPalette")) {
                this.palette.reflow();
            }

            this.picker.reflow();

        },

        toggle : function () {
            if (this._visible) {
                this.hide();
            } else {
                this.show();
            }
        },

        show : function () {
            if (this._visible) {
                this.reflow();
                return;
            }
            
            this._visible = true;

            //$(doc).on("keydown.ColorPane", onkeydown);
            //$(doc).on("click.ColorPane", clickout);
            //$(window).on("resize.ColorPane", resize);
            ///this.$replacer.addClass("sp-active");
            this.$el.removeClass("sp-hidden");

            this.reflow();
            
            this._updateUI();

            //this._drawInitial();
            
        },
        hide : function () {
            // Return if hiding is unnecessary
            if (!this._visible || this._flat) { return; }
            this._visible = false;

            //$(doc).off("keydown.ColorPane", onkeydown);
            //$(doc).off("click.ColorPane", clickout);
            //$(window).off("resize.ColorPane", resize);

            ///this.$replacer.removeClass("sp-active");
            this.$el.addClass("sp-hidden");
        },

        destroy : function () {
            ///this.$el.show();
            ///this.$offsetElement.off("click.ColorPane touchstart.ColorPane");
            ///this.$container.remove();
            ///this.$replacer.remove();
            //pickers[spect.id] = null;
        }

    });


    plugins.register(ColorPane);

    ColorPane.localization = {};

    return colors.ColorPane = ColorPane;

});
define('skylark-domx-colors/ColorBox',[
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins",
    "skylark-domx-popups",
    "skylark-graphics-color",
    "./colors",
    "./ColorPane"
   ],function(browser, noder, finder, $,eventer, styler,fx,plugins,popups,Color,colors,ColorPane) {
    "use strict";

    var ColorBox = plugins.Plugin.inherit({
        klassName : "ColorBox",

        pluginName : "domx.colors.box",

        options : {
            states : {
                showPalette: false,
                showPaletteOnly: false,
                togglePaletteOnly: false,
                showSelectionPalette: true,
                showInput: false,
                allowEmpty: false,
                showButtons: true,
                showInitial: false,
                showAlpha: false
            },

            // Options
            color: false,
            maxSelectionSize: 7,
            preferredFormat: false,
        },

        _updateUI : function () {
            var realColor = this.get(),
                displayColor = '';
             //reset background info for preview element
            this.$previewElement.removeClass("sp-clear-display");
            this.$previewElement.css('background-color', 'transparent');

            if (!realColor && this.stating("allowEmpty")) {
                // Update the replaced elements background with icon indicating no color selection
                this.$previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                this.$previewElement.css("background-color", realRgb);

                displayColor = realColor.toString();
            }

            this.pane._updateUI();
        },


        _applyOptions : function () {
            var opts = this.options;

            this._states = {
                allowEmpty : opts.states.allowEmpty,
                showInput : opts.states.showInput,
                showAlpha : opts.states.showAlpha,
                showButtons : opts.states.showButtons,
                togglePaletteOnly : opts.states.togglePaletteOnly,
                showPalette : opts.states.showPalette,
                showPaletteOnly : opts.states.showPaletteOnly,
                showSelectionPalette: opts.showSelectionPalette,
                showInitial : opts.states.showInitial
            };

           this._applyStates();

           this.reflow();
        },

         _construct: function(elm, options) {
            this.overrided(elm,options);

            this.$el = this.$();

            var opts = this.options,
            	$pane = this.$pane = $(opts.pane),
                $previewElement = this.$previewElement = this.$el.find(".sp-preview-inner");


            if ($pane[0]) {
                this.pane = ColorPane.instantiate($pane[0],{
                    color : opts.color,
                    palette : opts.palette,
                    selectionPalette : opts.selectionPalette,
                    states : {
		                showPalette:  opts.states.showPalette,
		                showPaletteOnly: opts.states.showPaletteOnly,
		                togglePaletteOnly: opts.states.togglePaletteOnly,
		                showSelectionPalette : opts.states.showSelectionPalette,
                        showInput: opts.states.showInput,
                        allowEmpty: opts.states.allowEmpty,
                        showButtons: opts.states.showButtons,
                        showInitial: opts.states.showInitial,
                        showAlpha: opts.states.showAlpha                                            
                    }
                })
            } 

            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;

            this._applyOptions();

            this.listenTo(this.$el,"click touchstart", function (e) {
                //if (!disabled) {
                    self.toggle();
                //}

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

        },

        revert :  function () {
        	this.pane.revert();
        },


        get : function () {
            return this.pane.get();
        },


        set : function (color) {
        	this.pane.set(color);
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

            this.$pane.css("position", "absolute");
            this.$pane.offset(popups.calcOffset(this.$pane[0], this.$el[0]));

            this.pane.reflow();

        },

        toggle : function () {
            if (this._visible) {
                this.hide();
            } else {
                this.show();
            }
        },

        show : function () {
            if (this._visible) {
                this.reflow();
                return;
            }
            
            this._visible = true;

            //$(doc).on("keydown.ColorBox", onkeydown);
            //$(doc).on("click.ColorBox", clickout);
            //$(window).on("resize.ColorBox", resize);
            this.$el.addClass("sp-active");
            this.$pane.removeClass("sp-hidden");

            this.reflow();
            
            this._updateUI();

            //this._drawInitial();
            
        },
        hide : function () {
            // Return if hiding is unnecessary
            if (!this._visible || this._flat) { return; }
            this._visible = false;

            //$(doc).off("keydown.ColorBox", onkeydown);
            //$(doc).off("click.ColorBox", clickout);
            //$(window).off("resize.ColorBox", resize);

            this.$el.removeClass("sp-active");
            this.$pane.addClass("sp-hidden");
        },

        destroy : function () {
            ///this.$el.show();
            ///this.$offsetElement.off("click.ColorBox touchstart.ColorBox");
            ///this.$container.remove();
            ///this.$replacer.remove();
            //pickers[spect.id] = null;
        }

    });


    plugins.register(ColorBox);

    ColorBox.localization = {};

    return colors.ColorBox = ColorBox;

});
define('skylark-domx-colors/colorer',[
    "skylark-langx/langx",
    "skylark-domx-query",
	"./colors",
	"./ColorBox",
	"./ColorPane"
],function(langx,$,colors,ColorBox,ColorPane){
   var pickers = [],
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    
    markup = (function () {
        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();


	function colorer(elmInput,options) {
		options = langx.mixin({
            // Options
            color: false,
            flat: false,
            appendTo: "body",
            maxSelectionSize: 7,
            preferredFormat: false,
            containerClassName: "",
            replacerClassName: "",
            theme: "sp-light",

            offset: null
		},options);

		var 
			theme = options.theme,
			flat = options.flat,
			appendTo = options.appendTo,
			$el = $(elmInput),
			$pane = $(markup,elmInput.ownerDocument).addClass(theme),
	        isInput = $el.is("input"),
	        isInputTypeColor = isInput && $el.attr("type") === "color",
	        shouldReplace = this._shouldReplace =  isInput && !flat,
	        $replacer =  (shouldReplace) ? $(replaceInput).addClass(theme)
	                                                      .addClass(options.className)
	                                                      .addClass(options.replacerClassName) 
	                                     : $([]),
	        $offsetElement =  (shouldReplace) ? $replacer : $el;


        delete options.flat;
        delete options.appendTo;

        options.color = options.color || (isInput && $el.val());

        if (shouldReplace) {
            $el.after($replacer).hide();
        }


        $pane.toggleClass("sp-flat", flat)
             .addClass(options.containerClassName);

        if (flat) {
            $el.after($pane).hide();
            var pane = new ColorPane($pane[0],options);
            pane.show();
            return pane;
        } else {
            var $appendTo = appendTo === "parent" ? $el.parent() : $(appendTo);
            if ($appendTo.length !== 1) {
                $appendTo = $("body");
            }

            $appendTo.append($pane);
            options.pane = $pane;
            return new ColorBox($replacer[0],options);
        }
	}

	return colors.colorer = colorer;
});
define('skylark-domx-colors/i18n/localization',[],function(){
	return {};
});
define('skylark-domx-colors/i18n/texts_ja',[
	"./localization"
],function(localization) {
    return localization["ja"] = {
        cancelText: "中止",
        chooseText: "選択"
    };
});
define('skylark-domx-colors/i18n/texts_zh-cn',[
    "./localization"
],function(localization) {
    return localization["zh-cn"] = {
        cancelText: "取消",
        chooseText: "选择",
        clearText: "清除",
        togglePaletteMoreText: "更多选项",
        togglePaletteLessText: "隐藏",
        noColorSelectedText: "尚未选择任何颜色"
    };
});

define('skylark-domx-colors/i18n/texts_zh-tw',[
    "./localization"
],function(localization) {
    return localization["zh-tw"] = {
        cancelText: "取消",
        chooseText: "選擇",
        clearText: "清除",
        togglePaletteMoreText: "更多選項",
        togglePaletteLessText: "隱藏",
        noColorSelectedText: "尚未選擇任何顏色"
    };

});
define('skylark-domx-colors/main',[
	"skylark-domx-query",
	"./colors",
    "./colorer",
    "./ColorPalette",
    "./ColorPicker",
    "./ColorPane",
    "./i18n/texts_ja",
    "./i18n/texts_zh-cn",
    "./i18n/texts_zh-tw"
], function($,colors,colorer) {
   
   $.fn.colorer = $.wraps.wrapper_every_act(colorer,colors);

   return colors;

});

define('skylark-domx-colors', ['skylark-domx-colors/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-colors.js.map
