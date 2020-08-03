define([
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