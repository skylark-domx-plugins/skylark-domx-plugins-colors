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