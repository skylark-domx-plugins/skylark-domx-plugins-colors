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
    "skylark-domx-popups",
    "skylark-graphics-color",
    "./colors",
    "./Indicator"
],function(skylark, langx, browser, noder, finder, $,eventer, styler,fx,plugins,popups,Color,colors,Indicator) {
    "use strict";

    var noop = langx.noop;

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


    var ColorPane = plugins.Plugin.inherit({
        klassName : "ColorPane",

        pluginName : "domx.colors.pane",

        options : {
            selectors  : {
                pickerContainer : ".sp-picker-container",
                toggleButton : ".sp-palette-toggle",
                paletteContainer : ".sp-palette",
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
            flat: false,
            clickoutFiresChange: true,
            hideAfterPaletteSelect: false,
            appendTo: "body",
            maxSelectionSize: 7,
            preferredFormat: false,
            containerClassName: "",
            replacerClassName: "",
            theme: "sp-light",
            palette: [
                ["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]
            ],
            selectionPalette: [],
            disabled: false,
            offset: null

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
                currentColor = this.get();

            var html = langx.map(this._paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            if (this._selectionPalette) {
                html.push(paletteTemplate(this.getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
            }

            this.$paletteContainer.html(html.join(""));
        },

        _drawInitial : function () {
            var opts = this.options;
            if (this.stating("showInitial")) {
                var initial = this._colorOnShow;
                var current = this.get();
                this.$initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
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
                togglePaletteOnly : opts.states.togglePaletteOnly,
                showPalette : opts.states.showPalette,
                showPaletteOnly : opts.states.showPaletteOnly,
                showInitial : opts.states.showInitial
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

            this.$container.toggleClass("sp-flat", opts.flat)
                            .addClass(opts.containerClassName);

           this._applyStates();

           this.reflow();
        },

         _construct: function(elm, options) {
            this.overrided(elm,options);

            this.$el = this.$();

            var opts = this.options,
                theme = opts.theme,
                selectionPalette = this._selectionPalette =  opts.selectionPalette.slice(0);


            var container = this.$container = $(markup,elm.ownerDocument).addClass(theme),
                pickerContainer = this.$pickerContainer =  container.find(opts.selectors.pickerContainer),
                dragger = this.$dragger = container.find(opts.selectors.dragger),
                dragHelper = this.$dragHelper = container.find(opts.selectors.dragHelper),
                slider = this.$slider = container.find(opts.selectors.slider),
                slideHelper = this.$slideHelper =  container.find(opts.selectors.slideHelper),
                alphaSliderInner = this.$alphaSliderInner = container.find(opts.selectors.alphaSliderInner),
                alphaSlider = this.$alphaSlider = container.find(opts.selectors.alphaSlider),
                alphaSlideHelper = this.$alphaSlideHelper = container.find(opts.selectors.alphaSlideHelper),
                textInput = this.$textInput = container.find(opts.selectors.textInput),
                paletteContainer = this.$paletteContainer =  container.find(opts.selectors.paletteContainer),
                initialColorContainer = this.$initialColorContainer = container.find(opts.selectors.initialColorContainer),
                cancelButton = this.$cancelButton = container.find(opts.selectors.cancelButton),
                clearButton = this.$clearButton = container.find(opts.selectors.clearButton),
                chooseButton = this.$chooseButton = container.find(opts.selectors.chooseButton),
                toggleButton = this.$toggleButton = container.find(opts.selectors.toggleButton),
                isInput = this._isInput = this.$el.is("input"),
                isInputTypeColor = isInput && this.$el.attr("type") === "color" && inputTypeColorSupport(),
                shouldReplace = this._shouldReplace =  isInput && !opts.flat,
                replacer = this.$replacer =  (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
                offsetElement = this.$offsetElement =  (shouldReplace) ? replacer : this.$el,
                previewElement = this.$previewElement = replacer.find(".sp-preview-inner"),
                initialColor = this._initialColor =  opts.color || (isInput && this.$el.val()),
                colorOnShow = this._colorOnShow = false,
                currentPreferredFormat = this._currentPreferredFormat = opts.preferredFormat,
                isEmpty = this._isEmpty =  !initialColor;


            function isValid() {
                return !textInput.hasClass("sp-validation-error");
            }



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
                self.$container.addClass(self.options.draggingClass);
                self._shiftMovementDirection = null;
                //this.$el.trigger('dragstart.ColorPane', [ get() ]);
            }

            function dragStop() {
                self._isDragging = false;
                self.$container.removeClass(self.options.draggingClass);
                //this.$el.trigger('dragstop.ColorPane', [ get() ]);
            }           

            function move() {
                self._updateUI();

                //callbacks.move(get());
                //this.$el.trigger('move.ColorPane', [ get() ]);
            }

            if (browser.isIE) {
                this.$container.find("*:not(input)").attr("unselectable", "on");
            }

            if (this._shouldReplace) {
                this.$el.after(this.$replacer).hide();
            }


            if (opts.flat) {
                this.$el.after(this.$container).hide();
            } else {
                var appendTo = opts.appendTo === "parent" ? this.$el.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(this.$container);
            }

            this._applyOptions();

            this.listenTo(this.$offsetElement,"click touchstart", function (e) {
                //if (!disabled) {
                    self.toggle();
                //}

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            //if(this.$el.is(":disabled") || (opts.disabled === true)) {
            //    disable();
            //}

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            ///this.$container.click(stopPropagation);

            // Handle user typed input
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
                //e.stopPropagation();
                //e.preventDefault();
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
                //e.stopPropagation();
                //e.preventDefault();
                eventer.stop(e);

                //if (browser.isIE && textInput.is(":focus")) {
                //    textInput.trigger('change');
                //}

                if (isValid()) {
                    self._updateOriginalInput(true);
                    self.hide();
                }
            });
          
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

                self._addColorToSelectionPalette(this._initialColor);
            } else {
                this._updateUI();
            }

            if (opts.flat) {
                this.show();
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

            var paletteEvent = browser.isIE ? "mousedown.ColorPane" : "click.ColorPane touchstart.ColorPane";
            this.$paletteContainer.on(paletteEvent, ".sp-thumb-el", paletteElementClick);
            this.$initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
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


            this.$container .toggleClass("sp-input-disabled", !states.showInput)
                            .toggleClass("sp-clear-enabled", !!states.allowEmpty)
                            .toggleClass("sp-alpha-enabled", states.showAlpha)
                            .toggleClass("sp-buttons-disabled", !states.showButtons)
                            .toggleClass("sp-palette-buttons-disabled", !states.togglePaletteOnly)
                            .toggleClass("sp-palette-disabled", !states.showPalette)
                            .toggleClass("sp-palette-only", states.showPaletteOnly)
                            .toggleClass("sp-initial-disabled", !states.showInitial);

            if (!states.allowEmpty) {
                this.$clearButton.hide();
            }

            if (states.showPaletteOnly && !this.option("flat")) {
                this.$container.css('left', '-=' + (this.$pickerContainer.outerWidth(true) + 5));
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
            //if (!this._visible) {
            //    return; // Calculations would be useless and wouldn't be reliable anyways
            //}


            if (!this.option("flat")) {
                this.$container.css("position", "absolute");
                var offset = this.option("offset"); 
                if (offset) {
                    this.$container.offset(offset);
                } else {
                    this.$container.offset(popups.calcOffset(this.$container[0], this.$offsetElement[0]));
                }
            }

            this._updateHelperLocations();

            if (this.stating("showPalette")) {
                this._drawPalette();
            }

            //this.$el.trigger('reflow');
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
            this.$replacer.addClass("sp-active");
            this.$container.removeClass("sp-hidden");

            this.reflow();
            
            this._updateUI();

            this._colorOnShow = this.get();

            //this._drawInitial();
            
        },
        hide : function () {
            // Return if hiding is unnecessary
            if (!this._visible || this._flat) { return; }
            this._visible = false;

            //$(doc).off("keydown.ColorPane", onkeydown);
            //$(doc).off("click.ColorPane", clickout);
            //$(window).off("resize.ColorPane", resize);

            this.$replacer.removeClass("sp-active");
            this.$container.addClass("sp-hidden");

        },

        destroy : function () {
            this.$el.show();
            this.$offsetElement.off("click.ColorPane touchstart.ColorPane");
            this.$container.remove();
            this.$replacer.remove();
            //pickers[spect.id] = null;
        }

    });


    plugins.register(ColorPane);

    ColorPane.localization = {};

    return colors.ColorPane = ColorPane;

});