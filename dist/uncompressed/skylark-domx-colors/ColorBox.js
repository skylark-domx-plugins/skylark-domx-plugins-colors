define([
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