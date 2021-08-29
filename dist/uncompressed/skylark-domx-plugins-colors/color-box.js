define([
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-popups",
    "skylark-graphics-colors/color",
    "./colors",
    "./Color-pane"
   ],function(langx, noder, finder, $,eventer, styler,plugins,popups,Color,colors,ColorPane) {
    "use strict";

    var ColorBox = plugins.Plugin.inherit({
        klassName : "ColorBox",

        pluginName : "lark.colors.box",

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