/**
 * skylark-domx-plugins-colors - The skylark color plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-colors/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-plugins-base","skylark-graphics-colors/color","./colors","./helper","./indicator"],function(t,i,e,s,r,a,l,h,n,o,p,d){"use strict";var c=h.Plugin.inherit({klassName:"ColorPicker",pluginName:"lark.colors.picker",options:{selectors:{dragger:".sp-color",dragHelper:".sp-dragger",slider:".sp-hue",slideHelper:".sp-slider",alphaSliderInner:".sp-alpha-inner",alphaSlider:".sp-alpha",alphaSlideHelper:".sp-alpha-handle",textInput:".sp-input",initialColorContainer:".sp-initial",cancelButton:".sp-cancel",clearButton:".sp-clear",chooseButton:".sp-choose"},draggingClass:"sp-dragging",texts:{cancelText:"cancel",chooseText:"choose",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected"},states:{showInput:!1,allowEmpty:!1,showButtons:!0,showInitial:!1,showAlpha:!1},preferredFormat:"hex",color:!1},_drawInitial:function(){var t=this.options;if(this.stating("showInitial")){var i=this._initialColor,e=this.current();this.$initialColorContainer.html(p.paletteTemplate([i,e],e,"sp-palette-row-initial",t))}},_updateHelperLocations:function(){var t=this._currentSaturation,i=this._currentValue;if(this.stating("allowEmpty")&&this._isEmpty)this.$alphaSlideHelper.hide(),this.$slideHelper.hide(),this.$dragHelper.hide();else{this.$alphaSlideHelper.show(),this.$slideHelper.show(),this.$dragHelper.show();var e=t*this._dragWidth,s=this._dragHeight-i*this._dragHeight;e=Math.max(-this._dragHelperHeight,Math.min(this._dragWidth-this._dragHelperHeight,e-this._dragHelperHeight)),s=Math.max(-this._dragHelperHeight,Math.min(this._dragHeight-this._dragHelperHeight,s-this._dragHelperHeight)),this.$dragHelper.css({top:s+"px",left:e+"px"});var r=this._currentAlpha*this._alphaWidth;this.$alphaSlideHelper.css({left:r-this._alphaSlideHelperWidth/2+"px"});var a=this._currentHue*this._slideHeight;this.$slideHelper.css({top:a-this._slideHelperHeight+"px"})}},_updateOriginalInput:function(t){var i=this.current();n.equals(i,this._colorOnShow);i&&(i.toString(this._currentPreferredFormat),this.emit("picked",i))},_updateUI:function(){this.options;this._dragWidth=this.$dragger.width(),this._dragHeight=this.$dragger.height(),this._dragHelperHeight=this.$dragHelper.height(),this._slideWidth=this.$slider.width(),this._slideHeight=this.$slider.height(),this._slideHelperHeight=this.$slideHelper.height(),this._alphaWidth=this.$alphaSlider.width(),this._alphaSlideHelperWidth=this.$alphaSlideHelper.width(),this.$textInput.removeClass("sp-validation-error"),this._updateHelperLocations();var t=n.parse({h:360*this._currentHue,s:1,v:1});this.$dragger.css("background-color",t.toHexString());var e=this._currentPreferredFormat;this._currentAlpha<1&&(0!==this._currentAlpha||"name"!==e)&&("hex"!==e&&"hex3"!==e&&"hex6"!==e&&"name"!==e||(e="rgb"));var s=this.current(),r="";if(!s&&this.stating("allowEmpty"));else{var a=s.toHexString();s.toRgbString();if(this.stating("showAlpha")){var l=s.toRgb();l.a=0;var h=n.parse(l).toRgbString(),o="linear-gradient(left, "+h+", "+a+")";i.isIE?this.$alphaSliderInner.css("filter",n.parse(h).toFilter({gradientType:1},a)):(this.$alphaSliderInner.css("background","-webkit-"+o),this.$alphaSliderInner.css("background","-moz-"+o),this.$alphaSliderInner.css("background","-ms-"+o),this.$alphaSliderInner.css("background","linear-gradient(to right, "+h+", "+a+")"))}r=s.toString(e)}this.stating("showInput")&&this.$textInput.val(r),this.stating("showPalette")&&this._drawPalette(),this._drawInitial()},_applyOptions:function(){var t=this.options;this._states={allowEmpty:t.states.allowEmpty,showInput:t.states.showInput,showAlpha:t.states.showAlpha,showButtons:t.states.showButtons,showInitial:t.states.showInitial},this._applyStates(),this.reflow()},_construct:function(t,i){h.Plugin.prototype._construct.call(this,t,i);var e=this.$el=this.$(),s=this.options,r=(s.theme,this.$dragger=e.find(s.selectors.dragger),this.$dragHelper=e.find(s.selectors.dragHelper),this.$slider=e.find(s.selectors.slider),this.$slideHelper=e.find(s.selectors.slideHelper),this.$alphaSliderInner=e.find(s.selectors.alphaSliderInner),this.$alphaSlider=e.find(s.selectors.alphaSlider),this.$alphaSlideHelper=e.find(s.selectors.alphaSlideHelper),this.$textInput=e.find(s.selectors.textInput),this.$initialColorContainer=e.find(s.selectors.initialColorContainer),this.$cancelButton=e.find(s.selectors.cancelButton),this.$clearButton=e.find(s.selectors.clearButton),this.$chooseButton=e.find(s.selectors.chooseButton),this._initialColor=s.color);this._currentPreferredFormat=s.preferredFormat,this._isEmpty=!r;this._init()},_init:function(){var t=this,e=this.options;function s(){(t._dragHeight<=0||t._dragWidth<=0||t._slideHeight<=0)&&t.reflow(),t._isDragging=!0,t.$el.addClass(t.options.draggingClass),t._shiftMovementDirection=null}function l(){t._isDragging=!1,t.$el.removeClass(t.options.draggingClass)}function h(){t._updateOriginalInput(),t._updateUI()}function o(){var i=t.$textInput.val();if(null!==i&&""!==i||!t._allowEmpty){var e=n.parse(i);e.isValid()?(t.current(e),h()):t.$textInput.addClass("sp-validation-error")}else t.current(null),h()}this._applyOptions(),this.$textInput.change(o),this.$textInput.on("paste",function(){setTimeout(o,1)}),this.$textInput.keydown(function(t){13==t.keyCode&&o()}),this.$cancelButton.text(e.texts.cancelText),this.listenTo(this.$cancelButton,"click",function(i){a.stop(i),t.revert(),t.emit("canceled")}),this.$clearButton.attr("title",e.texts.clearText),this.listenTo(this.$clearButton,"click",function(i){a.stop(i),t._isEmpty=!0,h()}),this.$chooseButton.text(e.texts.chooseText),this.listenTo(this.$chooseButton,"click",function(i){a.stop(i),t._updateOriginalInput(!0),t.emit("choosed")}),this.$alphaSlider.plugin("lark.colors.indicator",{onmove:function(i,e,s){t._currentAlpha=i/t._alphaWidth,t._isEmpty=!1,s.shiftKey&&(t._currentAlpha=Math.round(10*t._currentAlpha)/10),h()},onstart:s,onstop:l}),this.$slider.plugin("lark.colors.indicator",{onmove:function(i,e,s){t._currentHue=parseFloat(e/t._slideHeight),t._isEmpty=!1,t.stating("showAlpha")||(t._currentAlpha=1),h()},onstart:s,onstop:l}),this.$dragger.plugin("lark.colors.indicator",{onmove:function(i,e,s){if(s.shiftKey){if(!t._shiftMovementDirection){var r=t._currentSaturation*t._dragWidth,a=t._dragHeight-t._currentValue*t._dragHeight,l=Math.abs(i-r)>Math.abs(e-a);t._shiftMovementDirection=l?"x":"y"}}else t._shiftMovementDirection=null;var n=!t._shiftMovementDirection||"x"===t._shiftMovementDirection,o=!t._shiftMovementDirection||"y"===t._shiftMovementDirection;n&&(t._currentSaturation=parseFloat(i/t._dragWidth)),o&&(t._currentValue=parseFloat((t._dragHeight-e)/t._dragHeight)),t._isEmpty=!1,t.stating("showAlpha")||(t._currentAlpha=1),h()},onstart:s,onstop:l}),this.current(this._initialColor),t._updateUI();var p=i.isIE?"mousedown.ColorPicker":"click.ColorPicker touchstart.ColorPicker";this.$initialColorContainer.on(p,".sp-thumb-el:nth-child(1)",{ignore:!0},function(i){return i.data&&i.data.ignore,t.current(r(i.target).closest(".sp-thumb-el").data("color")),h(),!1})},revert:function(){this.current(this._initialColor,!0),this._updateOriginalInput(!0)},current:function(t){if(void 0===t)return this._allowEmpty&&this._isEmpty?null:n.parse({h:360*this._currentHue,s:this._currentSaturation,v:this._currentValue,a:Math.round(1e3*this._currentAlpha)/1e3});var i;n.equals(t,this.current())?this._updateUI():(!t&&this.stating("allowEmpty")?this._isEmpty=!0:(this._isEmpty=!1,i=n.parse(t).toHsv(),this._currentHue=i.h%360/360,this._currentSaturation=i.s,this._currentValue=i.v,this._currentAlpha=i.a),this._updateUI())},_applyStates:function(){var t=this._states;this.$el.toggleClass("sp-input-disabled",!t.showInput).toggleClass("sp-clear-enabled",!!t.allowEmpty).toggleClass("sp-alpha-enabled",t.showAlpha).toggleClass("sp-buttons-disabled",!t.showButtons).toggleClass("sp-initial-disabled",!t.showInitial),t.allowEmpty||this.$clearButton.hide(),this._dragWidth=this.$dragger.width(),this._dragHeight=this.$dragger.height(),this._dragHelperHeight=this.$dragHelper.height(),this._slideWidth=this.$slider.width(),this._slideHeight=this.$slider.height(),this._slideHelperHeight=this.$slideHelper.height(),this._alphaWidth=this.$alphaSlider.width(),this._alphaSlideHelperWidth=this.$alphaSlideHelper.width()},stating:function(t,i){if(void 0===i)return this._states[t];this._states[t]=i,this._applyStates()},reflow:function(){this._updateHelperLocations()}});return h.register(c),o.ColorPicker=c});
//# sourceMappingURL=sourcemaps/color-picker.js.map