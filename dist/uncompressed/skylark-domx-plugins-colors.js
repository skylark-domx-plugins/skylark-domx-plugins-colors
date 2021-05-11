/**
 * skylark-domx-plugins-colors - The skylark color plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-colors/
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

define('skylark-domx-plugins-colors/colors',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("domx.colores",{});
});
define('skylark-domx-plugins-colors/helper',[
    "skylark-domx-browser",
    "skylark-domx-query",
    "skylark-graphics-colors/Color"    
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

define('skylark-domx-plugins-colors/Indicator',[
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-plugins-base"    
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
            plugins.Plugin.prototype._construct.call(this,elm,options);

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
define('skylark-domx-plugins-colors/ColorPicker',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "skylark-graphics-colors/Color",
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

            preferredFormat : "hex",

            // Options
            color: false
        },
        
        _drawInitial : function () {
            var opts = this.options;
            if (this.stating("showInitial")) {
                var initialColor = this._initialColor;
                var currentColor = this.current();
                this.$initialColorContainer.html(
                    helper.paletteTemplate([initialColor, currentColor], currentColor, "sp-palette-row-initial", opts)
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
            var color = this.current(),
                displayColor = '',
                hasChanged = !Color.equals(color, this._colorOnShow);

            if (color) {
                displayColor = color.toString(this._currentPreferredFormat);
                // Update the selection palette with the current color
                this.emit("picked",color);
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

            var realColor = this.current(),
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
            plugins.Plugin.prototype._construct.call(this,elm,options);

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
            }

            function dragStop() {
                self._isDragging = false;
                self.$el.removeClass(self.options.draggingClass);
            }           

            function move() {
                self._updateOriginalInput();
                self._updateUI();
            }

            this._applyOptions();

            function setFromTextInput() {
                var value = self.$textInput.val();

                if ((value === null || value === "") && self._allowEmpty) {
                    self.current(null);
                    move();
                }
                else {
                    var tiny = Color.parse(value);
                    if (tiny.isValid()) {
                        self.current(tiny);
                        move();
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
                self.emit("canceled"); 
            });

            this.$clearButton.attr("title", opts.texts.clearText);
            this.listenTo(this.$clearButton,"click", function (e) {
                eventer.stop(e);
                self._isEmpty = true;
                move();

            });

            this.$chooseButton.text(opts.texts.chooseText);
            this.listenTo(this.$chooseButton,"click", function (e) {
                eventer.stop(e);

                self._updateOriginalInput(true);
                self.emit("choosed"); 
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

            this.current(this._initialColor);

            // In case color was black - update the preview UI and set the format
            // since the set function will not run (default color is black).
            self._updateUI();

            function paletteElementClick(e) {
                if (e.data && e.data.ignore) {
                    self.current($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }
                else {
                    self.current($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }

                return false;
            }

            var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";
            this.$initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
        },

        revert :  function () {
            this.current(this._initialColor, true);
            this._updateOriginalInput(true);
        },


        current : function(color) {
            if (color === undefined) {
                if (this._allowEmpty && this._isEmpty) {
                    return null;
                }


                return Color.parse({
                    h: this._currentHue * 360,
                    s: this._currentSaturation,
                    v: this._currentValue,
                    a: Math.round(this._currentAlpha * 1000) / 1000
                });

            } else {
                if (Color.equals(color, this.current())) {
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
define('skylark-domx-plugins-colors/ColorPalette',[
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins-base",
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
define('skylark-domx-plugins-colors/ColorPane',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-popups",
    "skylark-graphics-colors/Color",
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

           this._applyStates();

           this.reflow();
        },

         _construct: function(elm, options) {
            plugins.Plugin.prototype._construct.call(this,elm,options);

            var $el = this.$el = this.$();

            var opts = this.options,
                theme = opts.theme;


            var 
                //container = this.$container = $(markup,elm.ownerDocument).addClass(theme),
                pickerContainer = this.$pickerContainer =  $el.find(opts.selectors.pickerContainer),
                paletteContainer = this.$paletteContainer =  $el.find(opts.selectors.paletteContainer),
                toggleButton = this.$toggleButton = $el.find(opts.selectors.toggleButton),
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
                }) ;

                this.listenTo(this.picker,"canceled",(e) => {
                    this.emit("canceled");
                });    
                this.listenTo(this.picker,"choosed",(e) => {
                    this.emit("choosed");
                });    
                this.listenTo(this.picker,"picked",(e,color) => {
                    this.emit("picked",color);
                }); 
            }
            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;
           if (browser.isIE) {
                this.$container.find("*:not(input)").attr("unselectable", "on");
            }

            this._applyOptions();


          
            this.listenTo(this.$toggleButton,"click", function (e) {
                eventer.stop(e);

                self.stating("showPaletteOnly",!self.stating("showPaletteOnly"));
            });

            this.listenTo(this.palette,"selected",function(e,color){
                self.picker.current(color);
            });
        },

        revert :  function () {
            this.set(this._colorOnShow, true);
            this._updateOriginalInput(true);
        },


        get : function () {
            return this.picker.current();
        },


        set : function (color) {
            this.picker.current(color);
            this.palette.current(color);
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

            if (states.showPaletteOnly) {
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

            if (this.stating("showPalette")) {
                this.palette.reflow();
            }

            this.picker.reflow();

        }
    });


    plugins.register(ColorPane);

    return colors.ColorPane = ColorPane;
});
define('skylark-domx-plugins-colors/ColorBox',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-popups",
    "skylark-graphics-colors/Color",
    "./colors",
    "./ColorPane"
   ],function(langx, noder, finder, $,eventer, styler,plugins,popups,Color,colors,ColorPane) {
    "use strict";

    var ColorBox = plugins.Plugin.inherit({
        klassName : "ColorBox",

        pluginName : "domx.colors.box",

        options : {
            pane : {
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
                maxSelectionSize: 7,

                palette : undefined,
                selectionPalette : undefined
            },

            // Options
            color: false

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

           this.reflow();
        },

         _construct: function(elm, options) {
            plugins.Plugin.prototype._construct.call(this,elm,options);

            this.$el = this.$();

            var opts = this.options,
            	$pane = this.$pane = $(opts.pane.template),
                $previewElement = this.$previewElement = this.$el.find(".sp-preview-inner");


            if ($pane[0]) {
                this.pane = ColorPane.instantiate($pane[0],langx.mixin({
                    color : opts.color
                },opts.pane));

            } 

            this._init();

        },

        _init : function () {
            var self = this,
                opts = this.options;

            this._applyOptions();

            var paneIsVisible = false;
            this.$pane.hide();
            function showPane() {
                if (paneIsVisible) {
                    return;
                }
               
                paneIsVisible = true;

                self.$pane.show();

                self.reflow();
                
                self._updateUI();
                
            }

            function hidePane() {
                if (!paneIsVisible) {
                    return;
                }
                paneIsVisible = false;

                self.$pane.hide();
            }


            this.listenTo(this.$el,"click touchstart", function (e) {
                if (paneIsVisible) {
                    hidePane();
                } else {
                    showPane();
                }

              eventer.stop(e);
            });

            this.listenTo(this.pane,"picked",(e,color) => {

                // Update the replaced elements background color (with actual selected color)
                this.$previewElement.css("background-color", color.toRgbString());               
            });

            this.listenTo(this.pane,"canceled choosed",(e) => {
                hidePane();
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


        reflow : function () {

            this.$pane.css("position", "absolute");
            this.$pane.offset(popups.calcOffset(this.$pane[0], this.$el[0]));

            this.pane.reflow();

        }


    });

    plugins.register(ColorBox);

    return colors.ColorBox = ColorBox;

});
define('skylark-domx-plugins-colors/colorer',[
    "skylark-langx/langx",
    "skylark-domx-data",
    "skylark-domx-query",
	"./colors",
	"./ColorBox",
	"./ColorPane"
],function(langx,datax,$,colors,ColorBox,ColorPane){
   var pickers = [],
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    
    markup = (function () {
        return [
            "<div class='sp-container'>",
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

            offset: null,
            pane : {
                
            }
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
            if (options.picked) {
                pane.on("picked",options.picked);
            }
            if (options.choosed) {
                pane.on("choosed",options.choosed);               
            }
            if (options.canceled) {
                pane.on("canceled",options.canceled);               
            }
            $pane.show();
            return pane;
        } else {
            var $appendTo = appendTo === "parent" ? $el.parent() : $(appendTo);
            if ($appendTo.length !== 1) {
                $appendTo = $("body");
            }

            $appendTo.append($pane);
            options.pane.template = $pane;
            return new ColorBox($replacer[0],options);
        }
	}


   $.fn.colorer =  function (options) {
        var elm = this[0];

        if (elm) {
            var plugin    = datax.data(elm,'domx.colorer')
            if (!plugin) {
                plugin = colorer(elm,options)
                datax.data(elm,'domx.colorer',plugin);
            }

            return plugin;
        }
   };

  
	return colors.colorer = colorer;
});
define('skylark-domx-plugins-colors/Drag',[],function() {
    /**************************************************
     * dom-drag.js
     * 09.25.2001
     * www.youngpup.net
     **************************************************
     * 10.28.2001 - fixed minor bug where events
     * sometimes fired off the handle, not the root.
     **************************************************/

    var Drag = {

        obj : null,

        gradx : null,

        init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
        {
            o.onmousedown	= Drag.start;

            o.hmode			= bSwapHorzRef ? false : true ;
            o.vmode			= bSwapVertRef ? false : true ;

            o.root = oRoot && oRoot != null ? oRoot : o ;

            if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
           //if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
            if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
           // if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

            o.minX	= typeof minX != 'undefined' ? minX : null;
            o.minY	= typeof minY != 'undefined' ? minY : null;
            o.maxX	= typeof maxX != 'undefined' ? maxX : null;
            o.maxY	= typeof maxY != 'undefined' ? maxY : null;

            o.xMapper = fXMapper ? fXMapper : null;
            o.yMapper = fYMapper ? fYMapper : null;

            o.root.onDragStart	= new Function();
            o.root.onDragEnd	= new Function();
            o.root.onDrag		= new Function();
        },

        start : function(e)
        {
            Drag.gradx.current_slider_id = "#"+this.id;

            var o = Drag.obj = this;
            e = Drag.fixE(e);
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            o.root.onDragStart(x, y);

            o.lastMouseX	= e.clientX;
            o.lastMouseY	= e.clientY;

            if (o.hmode) {
                if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
                if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
            } else {
                if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
                if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
            }

            if (o.vmode) {
                if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
                if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;
            }
            else {
                if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
                if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
            }

            document.onmousemove	= Drag.drag;
            document.onmouseup	= Drag.end;

            return false;
        },

        drag : function(e)
        {
            e = Drag.fixE(e);
            var o = Drag.obj;

            Drag.gradx.update_style_array();
            Drag.gradx.apply_style(Drag.gradx.panel, Drag.gradx.get_style_value());
            var left = Drag.gradx.gx("#"+o.id).css("left");


            if(parseInt(left) > 60 && parseInt(left) < 390) {
                Drag.gradx.gx("#gradx_slider_info") //info element cached before
                .css("left",left)
                .show();
                         
            }/*else {
                if(parseInt(left) > 120) {
                    left = "272px";
                }else{
                    left = "120px";
                }
                    
                gradx.gx("#gradx_slider_info") //info element cached before
                .css("left",left)
                .show();
                     
            }*/
             var color = Drag.gradx.gx("#"+o.id).css("backgroundColor");
            //but what happens if @color is not in RGB ? :(
            var rgb = Drag.gradx.get_rgb_obj(color);
            Drag.gradx.cp.colorer().set(rgb);


            var ey	= e.clientY;
            var ex	= e.clientX;
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            var nx, ny;

            if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
            if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
            if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
            if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

            nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
            ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

            if (o.xMapper)		nx = o.xMapper(y)
            else if (o.yMapper)	ny = o.yMapper(x)

            Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
            //Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
            Drag.obj.lastMouseX	= ex;
            Drag.obj.lastMouseY	= ey;

            Drag.obj.root.onDrag(nx, ny);
            return false;
        },

        end : function()
        {
            document.onmousemove = null;
            document.onmouseup   = null;
            Drag.obj.root.onDragEnd(	parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]), 
                parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
            Drag.obj = null;
        },

        fixE : function(e)
        {
            if (typeof e == 'undefined') e = window.event;
            if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
            if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
            return e;
        }
    };

    return Drag;
});
define('skylark-domx-plugins-colors/Gradienter',[
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-plugins-base",    
    "skylark-graphics-colors/Color",
    "./colors",
    "./colorer",
    "./Drag"
],function( langx, browser, noder, eventer,finder, $, plugins,Color, colors,colorer,Drag) {


    /*
     *
     * SAMPLE USAGE DETAILS :
     * 
     * sliders structure :
     *
     * [
     *  {
     *     color: "COLOR",
     *     position: "POSITION" //0 to 100 without % symbol
     *  },
     *  {
     *     ....
     *     ....
     *  },
     *  ....
     * ]
     *
     */

    'use strict';

    //make me jquery UI  independent
    if (typeof $.fn.draggable === "undefined") {

        $.fn.draggable = function() {
            //console.log(this);
            var ele = document.getElementById(this.attr("id"));
            ele.style.top = "121px";
            Drag.init(ele, null, 26, 426, 86, 86);
            return this;
        };


    }


    var gradX  = function(id, _options) {


        var options = {
            targets: [], //[element selector] -> array
            sliders: [],
            direction: 'left',
            //if linear left | top | right | bottom
            //if radial left | center | right , top | center | bottom 
            type: 'linear', //linear | circle | ellipse
            code_shown: false, //false | true
            change: function(sliders, styles) {
                //nothing to do here by default
            }
        },
    	
        //make global	
        gradx = Drag.gradx = {
            rand_RGB: [],
            rand_pos: [],
            id: null,
            slider_ids: [],
            slider_index: 0, //global index for sliders
            sliders: [], //contains styles of each slider
            direction: "left", //direction of gradient or position of centre in case of radial gradients
            type: "linear", //linear or radial
            shape: "cover", //radial gradient size
            slider_hovered: [],
            jQ_present: true,
            code_shown: false,
            load_jQ: function() {

                //handle any library conflicts here
                this.gx = $;
            },
            //very lazy to replace this by jQuery
            add_event: function(el, evt, evt_func) {
                add_event(el, evt, evt_func);
            },
            get_random_position: function() {
                var pos;

                do {
                    pos = parseInt(Math.random() * 100);
                }
                while (this.rand_pos.indexOf(pos) > -1);

                this.rand_pos.push(pos);
                return pos;

            },
            get_random_rgb: function() {

                var R, G, B, color;

                do {
                    R = parseInt(Math.random() * 255);
                    G = parseInt(Math.random() * 255);
                    B = parseInt(Math.random() * 255);

                    color = "rgb(" + R + ", " + G + ", " + B + ")";
                }
                while (this.rand_RGB.indexOf(color) > -1);

                this.rand_RGB.push(color);
                return color;

            },
            //if target element is specified the target's style (background) is updated
            update_target: function(values) {

                if (this.targets.length > 0) {
                    //target elements exist

                    var i, j, ele, len = this.targets.length, v_len = values.length;
                    for (i = 0; i < len; i++) {
                        ele = gradx.gx(this.targets[i]);

                        for (j = 0; j < v_len; j++) {
                            ele.css("background-image", values[j]);
                        }

                    }
                }
            },
            //apply styles on fly
            apply_style: function(ele, value) {

                var type = 'linear';

                if (gradx.type != 'linear') {
                    type = 'radial';
                }

                if (value.indexOf(this.direction) > -1) {
                    //add cross-browser compatibility
                    var values = [
                        "-webkit-" + type + "-gradient(" + value + ")",
                        "-moz-" + type + "-gradient(" + value + ")",
                        "-ms-" + type + "-gradient(" + value + ")",
                        "-o-" + type + "-gradient(" + value + ")",
                        type + "-gradient(" + value + ")"
                    ];
                } else {
                    //normal color
                    values = [value];
                }



                var len = values.length, css = '';

                while (len > 0) {
                    len--;
                    ele.css("background", values[len]);
                    css += "background: " + values[len] + ";\n";
                }

                //call the userdefined change function
                this.change(this.sliders, values);
                this.update_target(values);


                gradx.gx('#gradx_code').html(css);

            },
            //on load
            apply_default_styles: function() {
                this.update_style_array()
                var value = this.get_style_value();
                this.apply_style(this.panel, value);
            },
            //update the slider_values[] while dragging
            update_style_array: function() {

                this.sliders = [];

                var len = gradx.slider_ids.length,
                        i, offset, position, id;

                for (i = 0; i < len; i++) {
                    id = "#" + gradx.slider_ids[i];
                    offset = parseInt(gradx.gx(id).css("left"));
                    position = parseInt((offset / gradx.container_width) * 100);
                    position -= 6; //TODO: find why this is required
                    gradx.sliders.push([gradx.gx(id).css("background-color"), position]);

                }

                this.sliders.sort(function(A, B) {
                    if (A[1] > B[1])
                        return 1;
                    else
                        return -1;
                });
            },
            //creates the complete css background value to later apply style
            get_style_value: function() {

                var len = gradx.slider_ids.length;

                if (len === 1) {
                    //since only one slider , so simple background

                    style_str = this.sliders[0][0];
                } else {
                    var style_str = "", suffix = "";
                    for (var i = 0; i < len; i++) {
                        if (this.sliders[i][1] == "") {
                            style_str += suffix + (this.sliders[i][0]);

                        } else {
                            if (this.sliders[i][1] > 100) {
                                this.sliders[i][1] = 100;
                            }
                            style_str += suffix + (this.sliders[i][0] + " " + this.sliders[i][1] + "%");

                        }
                        suffix = " , "; //add , from next iteration
                    }

                    if (this.type == 'linear') {
                        //direction, [color stoppers]
                        style_str = this.direction + " , " + style_str; //add direction for gradient
                    } else {
                        //position, type size, [color stoppers]
                        style_str = this.direction + " , " + this.type + " " + this.shape + " , " + style_str;
                    }
                }

                return style_str;
            },
            //@input rgb string rgb(<red>,<green>,<blue>)
            //@output rgb object of form { r: <red> , g: <green> , b : <blue>}
            get_rgb_obj: function(rgb) {

                //rgb(r,g,b)
                rgb = rgb.split("(");
                //r,g,b)
                rgb = rgb[1];
                //r g b)
                rgb = rgb.split(",");

                return {
                    r: parseInt(rgb[0]),
                    g: parseInt(rgb[1]),
                    b: parseInt(rgb[2])
                };

            },
            load_info: function(ele) {
                var id = "#" + ele.id;
                this.current_slider_id = id;
                //check if current clicked element is an slider
                if (this.slider_ids.indexOf(ele.id) > -1) { //javascript does not has # in its id

                    var color = gradx.gx(id).css("backgroundColor");
                    //but what happens if @color is not in RGB ? :(
                    var rgb = this.get_rgb_obj(color);

                    var left = gradx.gx(id).css("left");
                    if (parseInt(left) > 26 && parseInt(left) < 426) {
                        gradx.gx("#gradx_slider_info") //info element cached before
                                .css("left", left)
                                .show();

                    } 
                    
                    this.set_colorpicker(rgb);
                    console.log(rgb);
                }

            },
            //add slider
            add_slider: function(sliders) {


                var id, slider, k, position, value, delta;


                if (sliders.length === 0) {
                    sliders = [//default sliders
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position() //x percent of gradient panel(400px)
                        },
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position()
                        }
                    ];

                }


                var obj = sliders;

                for (k in obj) {

                    if (typeof obj[k].position === "undefined")
                        break;

                    //convert % to px based on containers width
                    var delta = 26; //range: 26px tp 426px
                    position = parseInt((obj[k].position * this.container_width) / 100) + delta + "px";

                    id = "gradx_slider_" + (this.slider_index); //create an id for this slider
                    this.sliders.push(
                            [
                                obj[k].color,
                                obj[k].position
                            ]
                            );

                    this.slider_ids.push(id); //for reference wrt to id

                    slider = "<div class='gradx_slider' id='" + id + "'></div>";
                    gradx.gx("#gradx_start_sliders_" + this.id).append(slider);

                    gradx.gx('#' + id).css("backgroundColor", obj[k].color).css("left", position);
                    this.slider_index++;
                }

                for (var i = 0, len = this.slider_ids.length; i < len; i++) {

                    gradx.gx('#' + this.slider_ids[i]).draggable({
                        containment: 'parent',
                        axis: 'x',
                        start: function() {
                            if (gradx.jQ_present)
                                gradx.current_slider_id = "#" + gradx.gx(this).attr("id"); //got full jQuery power here !
                        },
                        drag: function() {

                            gradx.update_style_array();
                            gradx.apply_style(gradx.panel, gradx.get_style_value());
                            var left = gradx.gx(gradx.current_slider_id).css("left");


                            if (parseInt(left) > 26 && parseInt(left) < 426) {
                                gradx.gx("#gradx_slider_info") //info element cached before
                                        .css("left", left)
                                        .show();

                            } /*else {
                             if (parseInt(left) > 120) {
                             left = "272px";
                             } else {
                             left = "120px";
                             }
                             
                             gradx.gx("#gradx_slider_info") //info element cached before
                             .css("left", left)
                             .show();
                             
                             }*/
                            var color = gradx.gx(gradx.current_slider_id).css("backgroundColor");
                            //but what happens if @color is not in RGB ? :(
                            var rgb = gradx.get_rgb_obj(color);
                            gradx.cp.colorer().set(rgb);

                        }

                    }).click(function() {
                        gradx.load_info(this);
                        return false;
                    });
                }


            },
            set_colorpicker: function(clr) {
                gradx.cp.colorer({
                    picked: function(e,color) {
                        if (gradx.current_slider_id != false) {
                            var rgba = color.toRgbString();
                            gradx.gx(gradx.current_slider_id).css('background-color', rgba);
                            gradx.update_style_array();
                            gradx.apply_style(gradx.panel, gradx.get_style_value());
                        }
                    },
                    choosed: function(e) {
                        gradx.gx("#gradx_slider_info").hide();
                    },
                    canceled: function(e) {
                        gradx.gx("#gradx_slider_info").hide();
                    },
                    
                    flat: true,
                    showAlpha: true,
                    color: clr,
                    clickoutFiresChange: true,
                    showInput: true,
                    showButtons: false

                });
            },
            generate_options: function(options) {

                var len = options.length,
                        name, state,
                        str = '';

                for (var i = 0; i < len; i++) {

                    name = options[i].split(" ");

                    name = name[0];

                    if (i < 2) {
                        state = name[1];
                    } else {
                        state = '';
                    }

                    name = name.replace("-", " ");

                    str += '<option value=' + options[i] + ' ' + state + '>' + name + '</option>';

                }

                return str;
            },
            generate_radial_options: function() {

                var options;
                options = ["horizontal-center disabled", "center selected", "left", "right"];
                gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

                options = ["vertical-center disabled", "center selected", "top", "bottom"];
                gradx.gx('#gradx_gradient_subtype2').html(gradx.generate_options(options)).show();

            },
            generate_linear_options: function() {

                var options;
                options = ["horizontal-center disabled", "left selected", "right", "top", "bottom"];
                gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

                gradx.gx('#gradx_gradient_subtype2').hide();

            },
            destroy: function() {
                var options = {
                    targets: [], //[element selector] -> array
                    sliders: [],
                    direction: 'left',
                    //if linear left | top | right | bottom
                    //if radial left | center | right , top | center | bottom 
                    type: 'linear', //linear | circle | ellipse
                    code_shown: false, //false | true
                    change: function(sliders, styles) {
                        //nothing to do here by default
                    }
                };

                for (var k in options) {
                    gradx[k] = options[k];
                }
            },
            load_gradx: function(id, sliders) {
                this.me = gradx.gx(id);
                this.id = id.replace("#", "");
                id = this.id;
                this.current_slider_id = false;
                var html = "<div class='gradx'>\n"+
                            "<div id='gradx_add_slider' class='gradx_add_slider gradx_btn'><i class='icon icon-add'></i>add</div>\n"+
                            "<div class='gradx_slectboxes'>\n"+
                            "<select id='gradx_gradient_type' class='gradx_gradient_type'>\n"+
                            "    <option value='linear'>Linear</option>\n"+
                            "    <option value='circle'>Radial - Circle</option>\n"+
                            "    <option value='ellipse'>Radial - Ellipse</option>\n"+
                            "</select>\n"+
                            "<select id='gradx_gradient_subtype' class='gradx_gradient_type'>\n"+
                            "    <option id='gradx_gradient_subtype_desc' value='gradient-direction' disabled>gradient direction</option>\n"+
                            "    <option value='left' selected>Left</option>\n"+
                            "    <option value='right'>Right</option>\n"+
                            "    <option value='top'>Top</option>\n"+
                            "    <option value='bottom'>Bottom</option>\n"+
                            "</select>\n"+
                            "<select id='gradx_gradient_subtype2' class='gradx_gradient_type gradx_hide'>\n"+
                            "</select>\n"+
                            "<select id='gradx_radial_gradient_size' class='gradx_gradient_type gradx_hide'>\n"+
                            "</select>\n"+
                            "</div>\n"+
                            "<div class='gradx_container' id='gradx_" + id + "'>\n"+
                            "    <div id='gradx_stop_sliders_" + id + "'></div>\n"+
                            "    <div class='gradx_panel' id='gradx_panel_" + id + "'></div>\n"+
                            "    <div class='gradx_start_sliders' id='gradx_start_sliders_" + id + "'>\n"+
                            "        <div class='cp-default' id='gradx_slider_info'>\n"+
                            "            <div id='gradx_slider_controls'>\n"+
                            "                <div id='gradx_delete_slider' class='gradx_btn'><i class='icon icon-remove'></i>delete</div>\n"+
                            "            </div>\n"+
                            "            <div id='gradx_slider_content'></div>\n"+
                            "        </div> \n"+
                            "    </div>\n"+
                            "</div>\n"+
                            "<div id='gradx_show_code' class='gradx_show_code gradx_btn'><i class='icon icon-file-css'></i><span>show the code</span></div>\n"+
                            "<div id='gradx_show_presets' style='display:none' class='gradx_show_presets gradx_btn'><i class='icon icon-preset'></i><span>show presets</span></div>\n"+
                            "<textarea class='gradx_code' id='gradx_code'></textarea>\n"+
                        "</div>";

                this.me.html(html);


                //generates html to select the different gradient sizes
                // *only available for radial gradients
                var gradient_size_val = ["gradient-size disabled", "closest-side selected", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover"],
                        option_str = '';


                option_str = gradx.generate_options(gradient_size_val);

                gradx.gx('#gradx_radial_gradient_size').html(option_str);


                //cache divs for fast reference

                this.container = gradx.gx("#gradx_" + id);
                this.panel = gradx.gx("#gradx_panel_" + id);
                //.hide();
                //this.info.hide();
                this.container_width = 400 //HARDCODE;
                this.add_slider(sliders);


                gradx.add_event(document, 'click', function() {
    //            if(!gradx.jQ_present){
                    if (!gradx.slider_hovered[id]) {
                        gradx.gx("#gradx_slider_info").hide();
                        return false;
                    }
                });



                gradx.gx('#gradx_add_slider').click(function() {
                    gradx.add_slider([
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position() //no % symbol
                        }
                    ]);
                    gradx.update_style_array();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                //cache the element
                gradx.cp = gradx.gx('#gradx_slider_content');

                //call the colorpicker plugin
                gradx.set_colorpicker("blue");

                gradx.gx('#gradx_delete_slider').click(function() {
                    gradx.gx(gradx.current_slider_id).remove();
                    gradx.gx("#gradx_slider_info").hide();
                    var id = gradx.current_slider_id.replace("#", "");

                    //remove all references from array for current deleted slider

                    for (var i = 0; i < gradx.slider_ids.length; i++) {
                        if (gradx.slider_ids[i] == id) {
                            gradx.slider_ids.splice(i, 1);
                        }
                    }

                    //apply modified style after removing the slider
                    gradx.update_style_array();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());

                    gradx.current_slider_id = false; //no slider is selected

                });

                gradx.gx('#gradx_code').focus(function() {
                    var $this = gradx.gx(this);
                    $this.select();

                    // Work around Chrome's little problem
                    $this.mouseup(function() {
                        // Prevent further mouseup intervention
                        $this.off("mouseup");
                        return false;
                    });
                });

                gradx.gx('#gradx_gradient_type').change(function() {

                    var type = gradx.gx(this).val(), options, option_str = '';

                    if (type !== "linear") {
                        //gradx.gx('#gradx_radial_gradient_size').show();

                        gradx.generate_radial_options();
                    } else {

                        gradx.generate_linear_options();
                        gradx.gx('#gradx_gradient_subtype').val("left");
                    }

                    gradx.type = type;
                    gradx.direction = gradx.gx('#gradx_gradient_subtype').val();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
                });

                //change type onload userdefined
                if (this.type !== "linear") {
                    gradx.gx('#gradx_gradient_type').val(this.type);
                    gradx.generate_radial_options();

                    var h, v;

                    if (this.direction !== 'left') {
                        //user has passed his own direction
                        var center;
                        if (this.direction.indexOf(",") > -1) {
                            center = this.direction.split(",");
                        } else {
                            //tolerate user mistakes
                            center = this.direction.split(" ");
                        }

                        h = center[0];
                        v = center[1];

                        //update the center points in the corr. select boxes
                        gradx.gx('#gradx_gradient_subtype').val(h);
                        gradx.gx('#gradx_gradient_subtype2').val(v);
                    } else {
                        var h = gradx.gx('#gradx_gradient_subtype').val();
                        var v = gradx.gx('#gradx_gradient_subtype2').val();
                    }

                    gradx.direction = h + " " + v;
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
                } else {

                    //change direction if not left
                    if (this.direction !== 'left') {
                        gradx.gx('#gradx_gradient_subtype').val(this.direction);
                    }
                }

                gradx.gx('#gradx_gradient_subtype').change(function() {

                    if (gradx.type === 'linear') {
                        gradx.direction = gradx.gx(this).val();
                    } else {
                        var h = gradx.gx(this).val();
                        var v = gradx.gx('#gradx_gradient_subtype2').val();
                        gradx.direction = h + " " + v;
                    }
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                gradx.gx('#gradx_gradient_subtype2').change(function() {

                    var h = gradx.gx('#gradx_gradient_subtype').val();
                    var v = gradx.gx(this).val();
                    gradx.direction = h + " " + v;
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                //not visible
                gradx.gx('#gradx_radial_gradient_size').change(function() {
                    gradx.shape = gradx.gx(this).val();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                gradx.gx('#gradx_show_code').click(function() {

                    if (gradx.code_shown) {
                        //hide it

                        gradx.code_shown = false;
                        gradx.gx('#gradx_show_code span').text("show the code");
                        gradx.gx("#gradx_code").hide();
                    }
                    else {
                        //show it

                        gradx.gx('#gradx_show_code span').text("hide the code");
                        gradx.gx("#gradx_code").show();
                        gradx.code_shown = true;
                    }
                });

                //show or hide onload
                if (gradx.code_shown) {
                    //show it

                    gradx.gx('#gradx_show_code span').text("hide the code");
                    gradx.gx("#gradx_code").show();

                }

                gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseout', function() {
                    gradx.slider_hovered[id] = false;
                });
                gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseover', function() {
                    gradx.slider_hovered[id] = true;

                });

            }




        };



        function  add_event(element, event, event_function)
        {
            if (element.attachEvent) //Internet Explorer
                element.attachEvent("on" + event, function() {
                    event_function.call(element);
                });
            else if (element.addEventListener) //Firefox & company
                element.addEventListener(event, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way
        }
        ;



        //load jQuery library into gradx.gx
        gradx.load_jQ();


        /* merge _options into options */
        langx.mixin(options, _options);

        //apply options to gradx object

        for (var k in options) {

            //load the options into gradx object
            gradx[k] = options[k];

        }

        gradx.load_gradx(id, gradx.sliders);
        gradx.apply_default_styles();


    };

    return colors.Gradienter = gradX;
});
define('skylark-domx-plugins-colors/main',[
	"skylark-domx-query",
	"./colors",
  "./colorer",
  "./ColorPalette",
  "./ColorPicker",
  "./ColorPane",
  "./Gradienter"
], function($,colors,colorer) {
   
   return colors;

});

define('skylark-domx-plugins-colors', ['skylark-domx-plugins-colors/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-colors.js.map
