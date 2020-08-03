define([
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