/**
 * skylark-domx-plugins-colors - The skylark color plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-colors/
 * @license MIT
 */
!function(t,e){var s=e.define,require=e.require,i="function"==typeof s&&s.amd,r=!i&&"undefined"!=typeof exports;if(!i&&!s){var a={};s=e.define=function(t,e,s){"function"==typeof s?(a[t]={factory:s,deps:e.map(function(e){return function(t,e){if("."!==t[0])return t;var s=e.split("/"),i=t.split("/");s.pop();for(var r=0;r<i.length;r++)"."!=i[r]&&(".."==i[r]?s.pop():s.push(i[r]));return s.join("/")}(e,t)}),resolved:!1,exports:null},require(t)):a[t]={factory:null,resolved:!0,exports:s}},require=e.require=function(t){if(!a.hasOwnProperty(t))throw new Error("Module "+t+" has not been defined");var module=a[t];if(!module.resolved){var s=[];module.deps.forEach(function(t){s.push(require(t))}),module.exports=module.factory.apply(e,s)||null,module.resolved=!0}return module.exports}}if(!s)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(t,require){t("skylark-domx-plugins-colors/colors",["skylark-domx-plugins-base/plugins"],function(t){"use strict";return t.colores={}}),t("skylark-domx-plugins-colors/helper",["skylark-domx-browser","skylark-domx-query","skylark-graphics-colors/Color"],function(t,e,s){t.isIE;return{paletteTemplate:function(t,i,r,a){for(var o=[],n=0;n<t.length;n++){var l=t[n];if(l){var d=s.parse(l),h=d.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";h+=s.equals(i,l)?" sp-thumb-active":"";var p=d.toString(a.preferredFormat||"rgb"),c="background-color:"+d.toRgbString();o.push('<span title="'+p+'" data-color="'+d.toRgbString()+'" class="'+h+'"><span class="sp-thumb-inner" style="'+c+';" /></span>')}else{o.push(e("<div />").append(e('<span data-color="" style="background-color:transparent;" class="sp-clear-display"></span>').attr("title",a.texts.noColorSelectedText)).html())}}return"<div class='sp-cf "+r+"'>"+o.join("")+"</div>"}}}),t("skylark-domx-plugins-colors/Indicator",["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-eventer","skylark-domx-finder","skylark-domx-query","skylark-domx-plugins-base"],function(t,e,s,i,r,a,o,n){var l=n.Plugin.inherit({klassName:"Indicator",pluginName:"lark.colors.indicator",options:{},_construct:function(t,e){n.Plugin.prototype._construct.call(this,t,e),this.listenTo(this.elmx(),"mousedown",t=>{this._start(t)})},_move:function(t){if(this._dragging){var e=this._offset,s=t.pageX,i=t.pageY,r=this._maxWidth,a=this._maxHeight,o=Math.max(0,Math.min(s-e.left,r)),n=Math.max(0,Math.min(i-e.top,a)),l=this.options.onmove;l&&l.apply(this._elm,[o,n,t])}},_start:function(t){var e=t.which?3==t.which:2==t.button;if(!e&&!this._dragging){var s=this.options.onstart;if(!s||!1!==s.apply(this._elm,arguments)){this._dragging=!0;var i=this.$();this._maxHeight=i.height(),this._maxWidth=i.width(),this._offset=i.offset();var a=this.$(document);this.listenTo(a,{mousemove:t=>{this._move(t)},mouseup:t=>{this._stop(t)}}),a.find("body").addClass("sp-dragging"),this._move(t),r.stop(t)}}},_stop:function(t){var e=this.$(document);this._dragging&&(this.unlistenTo(e),e.find("body").removeClass("sp-dragging"),onstop=this.options.onstop,onstop&&this._delay(function(){onstop.apply(this._elm,arguments)})),this._dragging=!1}});return n.register(l),l}),t("skylark-domx-plugins-colors/ColorPicker",["skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-plugins-base","skylark-graphics-colors/Color","./colors","./helper","./Indicator"],function(t,e,s,i,r,a,o,n,l,d,h,p){"use strict";var c=n.Plugin.inherit({klassName:"ColorPicker",pluginName:"lark.colors.picker",options:{selectors:{dragger:".sp-color",dragHelper:".sp-dragger",slider:".sp-hue",slideHelper:".sp-slider",alphaSliderInner:".sp-alpha-inner",alphaSlider:".sp-alpha",alphaSlideHelper:".sp-alpha-handle",textInput:".sp-input",initialColorContainer:".sp-initial",cancelButton:".sp-cancel",clearButton:".sp-clear",chooseButton:".sp-choose"},draggingClass:"sp-dragging",texts:{cancelText:"cancel",chooseText:"choose",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected"},states:{showInput:!1,allowEmpty:!1,showButtons:!0,showInitial:!1,showAlpha:!1},preferredFormat:"hex",color:!1},_drawInitial:function(){var t=this.options;if(this.stating("showInitial")){var e=this._initialColor,s=this.current();this.$initialColorContainer.html(h.paletteTemplate([e,s],s,"sp-palette-row-initial",t))}},_updateHelperLocations:function(){var t=this._currentSaturation,e=this._currentValue;if(this.stating("allowEmpty")&&this._isEmpty)this.$alphaSlideHelper.hide(),this.$slideHelper.hide(),this.$dragHelper.hide();else{this.$alphaSlideHelper.show(),this.$slideHelper.show(),this.$dragHelper.show();var s=t*this._dragWidth,i=this._dragHeight-e*this._dragHeight;s=Math.max(-this._dragHelperHeight,Math.min(this._dragWidth-this._dragHelperHeight,s-this._dragHelperHeight)),i=Math.max(-this._dragHelperHeight,Math.min(this._dragHeight-this._dragHelperHeight,i-this._dragHelperHeight)),this.$dragHelper.css({top:i+"px",left:s+"px"});var r=this._currentAlpha*this._alphaWidth;this.$alphaSlideHelper.css({left:r-this._alphaSlideHelperWidth/2+"px"});var a=this._currentHue*this._slideHeight;this.$slideHelper.css({top:a-this._slideHelperHeight+"px"})}},_updateOriginalInput:function(t){var e=this.current();l.equals(e,this._colorOnShow);e&&(e.toString(this._currentPreferredFormat),this.emit("picked",e))},_updateUI:function(){this.options;this._dragWidth=this.$dragger.width(),this._dragHeight=this.$dragger.height(),this._dragHelperHeight=this.$dragHelper.height(),this._slideWidth=this.$slider.width(),this._slideHeight=this.$slider.height(),this._slideHelperHeight=this.$slideHelper.height(),this._alphaWidth=this.$alphaSlider.width(),this._alphaSlideHelperWidth=this.$alphaSlideHelper.width(),this.$textInput.removeClass("sp-validation-error"),this._updateHelperLocations();var t=l.parse({h:360*this._currentHue,s:1,v:1});this.$dragger.css("background-color",t.toHexString());var s=this._currentPreferredFormat;this._currentAlpha<1&&(0!==this._currentAlpha||"name"!==s)&&("hex"!==s&&"hex3"!==s&&"hex6"!==s&&"name"!==s||(s="rgb"));var i=this.current(),r="";if(!i&&this.stating("allowEmpty"));else{var a=i.toHexString();i.toRgbString();if(this.stating("showAlpha")){var o=i.toRgb();o.a=0;var n=l.parse(o).toRgbString(),d="linear-gradient(left, "+n+", "+a+")";e.isIE?this.$alphaSliderInner.css("filter",l.parse(n).toFilter({gradientType:1},a)):(this.$alphaSliderInner.css("background","-webkit-"+d),this.$alphaSliderInner.css("background","-moz-"+d),this.$alphaSliderInner.css("background","-ms-"+d),this.$alphaSliderInner.css("background","linear-gradient(to right, "+n+", "+a+")"))}r=i.toString(s)}this.stating("showInput")&&this.$textInput.val(r),this.stating("showPalette")&&this._drawPalette(),this._drawInitial()},_applyOptions:function(){var t=this.options;this._states={allowEmpty:t.states.allowEmpty,showInput:t.states.showInput,showAlpha:t.states.showAlpha,showButtons:t.states.showButtons,showInitial:t.states.showInitial},this._applyStates(),this.reflow()},_construct:function(t,e){n.Plugin.prototype._construct.call(this,t,e);var s=this.$el=this.$(),i=this.options,r=(i.theme,this.$dragger=s.find(i.selectors.dragger),this.$dragHelper=s.find(i.selectors.dragHelper),this.$slider=s.find(i.selectors.slider),this.$slideHelper=s.find(i.selectors.slideHelper),this.$alphaSliderInner=s.find(i.selectors.alphaSliderInner),this.$alphaSlider=s.find(i.selectors.alphaSlider),this.$alphaSlideHelper=s.find(i.selectors.alphaSlideHelper),this.$textInput=s.find(i.selectors.textInput),this.$initialColorContainer=s.find(i.selectors.initialColorContainer),this.$cancelButton=s.find(i.selectors.cancelButton),this.$clearButton=s.find(i.selectors.clearButton),this.$chooseButton=s.find(i.selectors.chooseButton),this._initialColor=i.color);this._currentPreferredFormat=i.preferredFormat,this._isEmpty=!r;this._init()},_init:function(){var t=this,s=this.options;function i(){(t._dragHeight<=0||t._dragWidth<=0||t._slideHeight<=0)&&t.reflow(),t._isDragging=!0,t.$el.addClass(t.options.draggingClass),t._shiftMovementDirection=null}function o(){t._isDragging=!1,t.$el.removeClass(t.options.draggingClass)}function n(){t._updateOriginalInput(),t._updateUI()}function d(){var e=t.$textInput.val();if(null!==e&&""!==e||!t._allowEmpty){var s=l.parse(e);s.isValid()?(t.current(s),n()):t.$textInput.addClass("sp-validation-error")}else t.current(null),n()}this._applyOptions(),this.$textInput.change(d),this.$textInput.on("paste",function(){setTimeout(d,1)}),this.$textInput.keydown(function(t){13==t.keyCode&&d()}),this.$cancelButton.text(s.texts.cancelText),this.listenTo(this.$cancelButton,"click",function(e){a.stop(e),t.revert(),t.emit("canceled")}),this.$clearButton.attr("title",s.texts.clearText),this.listenTo(this.$clearButton,"click",function(e){a.stop(e),t._isEmpty=!0,n()}),this.$chooseButton.text(s.texts.chooseText),this.listenTo(this.$chooseButton,"click",function(e){a.stop(e),t._updateOriginalInput(!0),t.emit("choosed")}),this.$alphaSlider.plugin("domx.indicator",{onmove:function(e,s,i){t._currentAlpha=e/t._alphaWidth,t._isEmpty=!1,i.shiftKey&&(t._currentAlpha=Math.round(10*t._currentAlpha)/10),n()},onstart:i,onstop:o}),this.$slider.plugin("domx.indicator",{onmove:function(e,s,i){t._currentHue=parseFloat(s/t._slideHeight),t._isEmpty=!1,t.stating("showAlpha")||(t._currentAlpha=1),n()},onstart:i,onstop:o}),this.$dragger.plugin("domx.indicator",{onmove:function(e,s,i){if(i.shiftKey){if(!t._shiftMovementDirection){var r=t._currentSaturation*t._dragWidth,a=t._dragHeight-t._currentValue*t._dragHeight,o=Math.abs(e-r)>Math.abs(s-a);t._shiftMovementDirection=o?"x":"y"}}else t._shiftMovementDirection=null;var l=!t._shiftMovementDirection||"x"===t._shiftMovementDirection,d=!t._shiftMovementDirection||"y"===t._shiftMovementDirection;l&&(t._currentSaturation=parseFloat(e/t._dragWidth)),d&&(t._currentValue=parseFloat((t._dragHeight-s)/t._dragHeight)),t._isEmpty=!1,t.stating("showAlpha")||(t._currentAlpha=1),n()},onstart:i,onstop:o}),this.current(this._initialColor),t._updateUI();var h=e.isIE?"mousedown.ColorPicker":"click.ColorPicker touchstart.ColorPicker";this.$initialColorContainer.on(h,".sp-thumb-el:nth-child(1)",{ignore:!0},function(e){e.data&&e.data.ignore,t.current(r(e.target).closest(".sp-thumb-el").data("color")),n();return!1})},revert:function(){this.current(this._initialColor,!0),this._updateOriginalInput(!0)},current:function(t){if(void 0===t)return this._allowEmpty&&this._isEmpty?null:l.parse({h:360*this._currentHue,s:this._currentSaturation,v:this._currentValue,a:Math.round(1e3*this._currentAlpha)/1e3});var e,s;l.equals(t,this.current())?this._updateUI():(!t&&this.stating("allowEmpty")?this._isEmpty=!0:(this._isEmpty=!1,e=l.parse(t),s=e.toHsv(),this._currentHue=s.h%360/360,this._currentSaturation=s.s,this._currentValue=s.v,this._currentAlpha=s.a),this._updateUI())},_applyStates:function(){var t=this._states;this.$el.toggleClass("sp-input-disabled",!t.showInput).toggleClass("sp-clear-enabled",!!t.allowEmpty).toggleClass("sp-alpha-enabled",t.showAlpha).toggleClass("sp-buttons-disabled",!t.showButtons).toggleClass("sp-initial-disabled",!t.showInitial),t.allowEmpty||this.$clearButton.hide(),this._dragWidth=this.$dragger.width(),this._dragHeight=this.$dragger.height(),this._dragHelperHeight=this.$dragHelper.height(),this._slideWidth=this.$slider.width(),this._slideHeight=this.$slider.height(),this._slideHelperHeight=this.$slideHelper.height(),this._alphaWidth=this.$alphaSlider.width(),this._alphaSlideHelperWidth=this.$alphaSlideHelper.width()},stating:function(t,e){if(void 0===e)return this._states[t];this._states[t]=e,this._applyStates()},reflow:function(){this._updateHelperLocations()}});return n.register(c),d.ColorPicker=c}),t("skylark-domx-plugins-colors/ColorPalette",["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-fx","skylark-domx-plugins-base","skylark-graphics-colors/Color","./colors","./helper"],function(t,e,s,i,r,a,o,n,l,d,h,p,c){"use strict";e.noop;var g=d.Plugin.inherit({klassName:"ColorPalette",pluginName:"lark.colors.palette",options:{selectors:{},texts:{},states:{showSelectionPalette:!0},palette:[["#ffffff","#000000","#ff0000","#ff8000","#ffff00","#008000","#0000ff","#4b0082","#9400d3"]],selectionPalette:[]},_addColorToSelectionPalette:function(t){if(this.stating("showSelectionPalette")){var s=h.parse(t).toRgbString();if(!this._paletteLookup[s]&&-1===e.inArray(s,this._selectionPalette))for(this._selectionPalette.push(s);this._selectionPalette.length>this._maxSelectionSize;)this._selectionPalette.shift()}},getUniqueSelectionPalette:function(){var t=[],e=this.options;if(this.stating("showPalette"))for(var s=0;s<this._selectionPalette.length;s++){var i=h.parse(this._selectionPalette[s]).toRgbString();this._paletteLookup[i]||t.push(this._selectionPalette[s])}return t.reverse().slice(0,e.maxSelectionSize)},_drawPalette:function(){var t=this.options,s=this.current(),i=e.map(this._paletteArray,function(e,i){return c.paletteTemplate(e,s,"sp-palette-row sp-palette-row-"+i,t)});this._selectionPalette&&i.push(c.paletteTemplate(this.getUniqueSelectionPalette(),s,"sp-palette-row sp-palette-row-selection",t)),this.$el.html(i.join(""))},_updateUI:function(){this._drawPalette()},_applyOptions:function(){var t=this.options;if(this._states={showSelectionPalette:t.showSelectionPalette},t.palette)for(var s=this._palette=t.palette.slice(0),i=this._paletteArray=e.isArray(s[0])?s:[s],r=this._paletteLookup={},a=0;a<i.length;a++)for(var o=0;o<i[a].length;o++){var n=h.parse(i[a][o]).toRgbString();r[n]=!0}this._applyStates()},_construct:function(t,e){d.Plugin.prototype._construct.call(this,t,e),this.$el=this.$(),this._init()},_init:function(){var t=this,e=this.options;this._initialColor=e.color,this._selectionPalette=e.selectionPalette.slice(0);this._applyOptions(),this._initialColor?(this.current(this._initialColor),t._addColorToSelectionPalette(this._initialColor)):this._updateUI();var i=s.isIE?"mousedown.palette":"click.palette touchstart.palette";this.$el.on(i,".sp-thumb-el",function(e){return t.current(a(e.target).closest(".sp-thumb-el").data("color")),t.emit("selected",t.current()),!1})},_applyStates:function(){},stating:function(t,e){if(void 0===e)return this._states[t];this._states[t]=e,this._applyStates()},reflow:function(){this._drawPalette()},current:function(t){if(void 0===t)return this._current;this._current=t,this._updateUI()}});return d.register(g),p.ColorPalette=g}),t("skylark-domx-plugins-colors/ColorPane",["skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-fx","skylark-domx-plugins-base","skylark-domx-plugins-popups","skylark-graphics-colors/Color","./colors","./ColorPicker","./ColorPalette"],function(t,e,s,i,r,a,o,n,l,d,h,p,c,g){"use strict";var u=l.Plugin.inherit({klassName:"ColorPane",pluginName:"lark.colors.pane",options:{selectors:{pickerContainer:".sp-picker-container",toggleButton:".sp-palette-toggle",paletteContainer:".sp-palette"},draggingClass:"sp-dragging",texts:{togglePaletteMoreText:"more",togglePaletteLessText:"less",clearText:"Clear Color Selection",noColorSelectedText:"No Color Selected"},states:{showPalette:!1,showPaletteOnly:!1,togglePaletteOnly:!1,showSelectionPalette:!0,showInput:!1,allowEmpty:!1,showButtons:!0,showInitial:!1,showAlpha:!1},color:!1,maxSelectionSize:7},_updateUI:function(){this.stating("showPalette")&&this.palette._updateUI(),this.picker._updateUI()},_applyOptions:function(){var t=this.options;this._states={allowEmpty:t.states.allowEmpty,showInput:t.states.showInput,showAlpha:t.states.showAlpha,showButtons:t.states.showButtons,togglePaletteOnly:t.states.togglePaletteOnly,showPalette:t.states.showPalette,showPaletteOnly:t.states.showPaletteOnly,showSelectionPalette:t.showSelectionPalette,showInitial:t.states.showInitial},this._applyStates(),this.reflow()},_construct:function(t,e){l.Plugin.prototype._construct.call(this,t,e);var s=this.$el=this.$(),i=this.options,r=(i.theme,this.$pickerContainer=s.find(i.selectors.pickerContainer)),a=this.$paletteContainer=s.find(i.selectors.paletteContainer),o=(this.$toggleButton=s.find(i.selectors.toggleButton),this._initialColor=i.color);this._isEmpty=!o;a[0]&&(this.palette=g.instantiate(a[0],{selectionPalette:i.selectionPalette,color:i.color,palette:i.palette,selectionPalette:i.selectionPalette})),r[0]&&(this.picker=c.instantiate(r[0],{color:i.color,states:{showInput:i.states.showInput,allowEmpty:i.states.allowEmpty,showButtons:i.states.showButtons,showInitial:i.states.showInitial,showAlpha:i.states.showAlpha}}),this.listenTo(this.picker,"canceled",t=>{this.emit("canceled")}),this.listenTo(this.picker,"choosed",t=>{this.emit("choosed")}),this.listenTo(this.picker,"picked",(t,e)=>{this.emit("picked",e)})),this._init()},_init:function(){var t=this;this.options;e.isIE&&this.$container.find("*:not(input)").attr("unselectable","on"),this._applyOptions(),this.listenTo(this.$toggleButton,"click",function(e){a.stop(e),t.stating("showPaletteOnly",!t.stating("showPaletteOnly"))}),this.listenTo(this.palette,"selected",function(e,s){t.picker.current(s)})},revert:function(){this.set(this._colorOnShow,!0),this._updateOriginalInput(!0)},get:function(){return this.picker.current()},set:function(t){this.picker.current(t),this.palette.current(t)},_applyStates:function(){var t=this._states;t.showPaletteOnly&&(t.showPalette=!0),this.$toggleButton.text(t.showPaletteOnly?this.option("texts.togglePaletteMoreText"):this.option("texts.togglePaletteLessText")),this.$el.toggleClass("sp-input-disabled",!t.showInput).toggleClass("sp-clear-enabled",!!t.allowEmpty).toggleClass("sp-alpha-enabled",t.showAlpha).toggleClass("sp-buttons-disabled",!t.showButtons).toggleClass("sp-palette-buttons-disabled",!t.togglePaletteOnly).toggleClass("sp-palette-disabled",!t.showPalette).toggleClass("sp-palette-only",t.showPaletteOnly).toggleClass("sp-initial-disabled",!t.showInitial),t.showPaletteOnly&&this.$el.css("left","-="+(this.$pickerContainer.outerWidth(!0)+5))},stating:function(t,e){if(void 0===e)return this._states[t];this._states[t]=e,this._applyStates()},reflow:function(){this.stating("showPalette")&&this.palette.reflow(),this.picker.reflow()}});return l.register(u),p.ColorPane=u}),t("skylark-domx-plugins-colors/ColorBox",["skylark-langx/langx","skylark-domx-noder","skylark-domx-finder","skylark-domx-query","skylark-domx-eventer","skylark-domx-styler","skylark-domx-plugins-base","skylark-domx-plugins-popups","skylark-graphics-colors/Color","./colors","./ColorPane"],function(t,e,s,i,r,a,o,n,l,d,h){"use strict";var p=o.Plugin.inherit({klassName:"ColorBox",pluginName:"lark.colors.box",options:{pane:{states:{showPalette:!1,showPaletteOnly:!1,togglePaletteOnly:!1,showSelectionPalette:!0,showInput:!1,allowEmpty:!1,showButtons:!0,showInitial:!1,showAlpha:!1},maxSelectionSize:7,palette:void 0,selectionPalette:void 0},color:!1},_updateUI:function(){var t=this.get();if(this.$previewElement.removeClass("sp-clear-display"),this.$previewElement.css("background-color","transparent"),!t&&this.stating("allowEmpty"))this.$previewElement.addClass("sp-clear-display");else{t.toHexString();var e=t.toRgbString();this.$previewElement.css("background-color",e),t.toString()}this.pane._updateUI()},_applyOptions:function(){this.reflow()},_construct:function(e,s){o.Plugin.prototype._construct.call(this,e,s),this.$el=this.$();var r=this.options,a=this.$pane=i(r.pane.template);this.$previewElement=this.$el.find(".sp-preview-inner");a[0]&&(this.pane=h.instantiate(a[0],t.mixin({color:r.color},r.pane))),this._init()},_init:function(){var t=this;this.options;this._applyOptions();var e=!1;function s(){e&&(e=!1,t.$pane.hide())}this.$pane.hide(),this.listenTo(this.$el,"click touchstart",function(i){e?s():function(){if(e)return;e=!0,t.$pane.show(),t.reflow(),t._updateUI()}(),r.stop(i)}),this.listenTo(this.pane,"picked",(t,e)=>{this.$previewElement.css("background-color",e.toRgbString())}),this.listenTo(this.pane,"canceled choosed",t=>{s()})},revert:function(){this.pane.revert()},get:function(){return this.pane.get()},set:function(t){this.pane.set(t)},reflow:function(){this.$pane.css("position","absolute"),this.$pane.offset(n.calcOffset(this.$pane[0],this.$el[0])),this.pane.reflow()}});return o.register(p),d.ColorBox=p}),t("skylark-domx-plugins-colors/colorer",["skylark-langx/langx","skylark-domx-data","skylark-domx-query","./colors","./ColorBox","./ColorPane"],function(t,e,s,i,r,a){var o=["<div class='sp-replacer'>","<div class='sp-preview'><div class='sp-preview-inner'></div></div>","<div class='sp-dd'>&#9660;</div>","</div>"].join(""),n=["<div class='sp-container'>","<div class='sp-palette-container'>","<div class='sp-palette sp-thumb sp-cf'></div>","<div class='sp-palette-button-container sp-cf'>","<button type='button' class='sp-palette-toggle'></button>","</div>","</div>","<div class='sp-picker-container'>","<div class='sp-top sp-cf'>","<div class='sp-fill'></div>","<div class='sp-top-inner'>","<div class='sp-color'>","<div class='sp-sat'>","<div class='sp-val'>","<div class='sp-dragger'></div>","</div>","</div>","</div>","<div class='sp-clear sp-clear-display'>","</div>","<div class='sp-hue'>","<div class='sp-slider'></div>","</div>","</div>","<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>","</div>","<div class='sp-input-container sp-cf'>","<input class='sp-input' type='text' spellcheck='false'  />","</div>","<div class='sp-initial sp-thumb sp-cf'></div>","<div class='sp-button-container sp-cf'>","<a class='sp-cancel' href='#'></a>","<button type='button' class='sp-choose'></button>","</div>","</div>","</div>"].join("");function l(e,i){var l=(i=t.mixin({color:!1,flat:!1,appendTo:"body",maxSelectionSize:7,preferredFormat:!1,containerClassName:"",replacerClassName:"",theme:"sp-light",offset:null,pane:{}},i)).theme,d=i.flat,h=i.appendTo,p=s(e),c=s(n,e.ownerDocument).addClass(l),g=p.is("input"),u=(g&&p.attr("type"),this._shouldReplace=g&&!d),_=u?s(o).addClass(l).addClass(i.className).addClass(i.replacerClassName):s([]);if(delete i.flat,delete i.appendTo,i.color=i.color||g&&p.val(),u&&p.after(_).hide(),c.toggleClass("sp-flat",d).addClass(i.containerClassName),d){p.after(c).hide();var x=new a(c[0],i);return i.picked&&x.on("picked",i.picked),i.choosed&&x.on("choosed",i.choosed),i.canceled&&x.on("canceled",i.canceled),c.show(),x}var f="parent"===h?p.parent():s(h);return 1!==f.length&&(f=s("body")),f.append(c),i.pane.template=c,new r(_[0],i)}return s.fn.colorer=function(t){var s=this[0];if(s){var i=e.data(s,"domx.colorer");return i||(i=l(s,t),e.data(s,"domx.colorer",i)),i}},i.colorer=l}),t("skylark-domx-plugins-colors/Drag",[],function(){var t={obj:null,gradx:null,init:function(e,s,i,r,a,o,n,l,d,h){e.onmousedown=t.start,e.hmode=!n,e.vmode=!l,e.root=s&&null!=s?s:e,e.hmode&&isNaN(parseInt(e.root.style.left))&&(e.root.style.left="0px"),!e.hmode&&isNaN(parseInt(e.root.style.right))&&(e.root.style.right="0px"),e.minX=void 0!==i?i:null,e.minY=void 0!==a?a:null,e.maxX=void 0!==r?r:null,e.maxY=void 0!==o?o:null,e.xMapper=d||null,e.yMapper=h||null,e.root.onDragStart=new Function,e.root.onDragEnd=new Function,e.root.onDrag=new Function},start:function(e){t.gradx.current_slider_id="#"+this.id;var s=t.obj=this;e=t.fixE(e);var i=parseInt(s.vmode?s.root.style.top:s.root.style.bottom),r=parseInt(s.hmode?s.root.style.left:s.root.style.right);return s.root.onDragStart(r,i),s.lastMouseX=e.clientX,s.lastMouseY=e.clientY,s.hmode?(null!=s.minX&&(s.minMouseX=e.clientX-r+s.minX),null!=s.maxX&&(s.maxMouseX=s.minMouseX+s.maxX-s.minX)):(null!=s.minX&&(s.maxMouseX=-s.minX+e.clientX+r),null!=s.maxX&&(s.minMouseX=-s.maxX+e.clientX+r)),s.vmode?(null!=s.minY&&(s.minMouseY=e.clientY-i+s.minY),null!=s.maxY&&(s.maxMouseY=s.minMouseY+s.maxY-s.minY)):(null!=s.minY&&(s.maxMouseY=-s.minY+e.clientY+i),null!=s.maxY&&(s.minMouseY=-s.maxY+e.clientY+i)),document.onmousemove=t.drag,document.onmouseup=t.end,!1},drag:function(e){e=t.fixE(e);var s=t.obj;t.gradx.update_style_array(),t.gradx.apply_style(t.gradx.panel,t.gradx.get_style_value());var i=t.gradx.gx("#"+s.id).css("left");parseInt(i)>60&&parseInt(i)<390&&t.gradx.gx("#gradx_slider_info").css("left",i).show();var r=t.gradx.gx("#"+s.id).css("backgroundColor"),a=t.gradx.get_rgb_obj(r);t.gradx.cp.colorer().set(a);var o,n,l=e.clientY,d=e.clientX,h=parseInt(s.vmode?s.root.style.top:s.root.style.bottom),p=parseInt(s.hmode?s.root.style.left:s.root.style.right);return null!=s.minX&&(d=s.hmode?Math.max(d,s.minMouseX):Math.min(d,s.maxMouseX)),null!=s.maxX&&(d=s.hmode?Math.min(d,s.maxMouseX):Math.max(d,s.minMouseX)),null!=s.minY&&(l=s.vmode?Math.max(l,s.minMouseY):Math.min(l,s.maxMouseY)),null!=s.maxY&&(l=s.vmode?Math.min(l,s.maxMouseY):Math.max(l,s.minMouseY)),o=p+(d-s.lastMouseX)*(s.hmode?1:-1),n=h+(l-s.lastMouseY)*(s.vmode?1:-1),s.xMapper?o=s.xMapper(h):s.yMapper&&(n=s.yMapper(p)),t.obj.root.style[s.hmode?"left":"right"]=o+"px",t.obj.lastMouseX=d,t.obj.lastMouseY=l,t.obj.root.onDrag(o,n),!1},end:function(){document.onmousemove=null,document.onmouseup=null,t.obj.root.onDragEnd(parseInt(t.obj.root.style[t.obj.hmode?"left":"right"]),parseInt(t.obj.root.style[t.obj.vmode?"top":"bottom"])),t.obj=null},fixE:function(t){return void 0===t&&(t=window.event),void 0===t.layerX&&(t.layerX=t.offsetX),void 0===t.layerY&&(t.layerY=t.offsetY),t}};return t}),t("skylark-domx-plugins-colors/Gradienter",["skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-eventer","skylark-domx-finder","skylark-domx-query","skylark-domx-plugins-base","skylark-graphics-colors/Color","./colors","./colorer","./Drag"],function(t,e,s,i,r,a,o,n,l,d,h){"use strict";void 0===a.fn.draggable&&(a.fn.draggable=function(){var t=document.getElementById(this.attr("id"));return t.style.top="121px",h.init(t,null,26,426,86,86),this});return l.Gradienter=function(e,s){var i={targets:[],sliders:[],direction:"left",type:"linear",code_shown:!1,change:function(t,e){}},r=h.gradx={rand_RGB:[],rand_pos:[],id:null,slider_ids:[],slider_index:0,sliders:[],direction:"left",type:"linear",shape:"cover",slider_hovered:[],jQ_present:!0,code_shown:!1,load_jQ:function(){this.gx=a},add_event:function(t,e,s){var i,r,a;r=e,a=s,(i=t).attachEvent?i.attachEvent("on"+r,function(){a.call(i)}):i.addEventListener&&i.addEventListener(r,a,!1)},get_random_position:function(){var t;do{t=parseInt(100*Math.random())}while(this.rand_pos.indexOf(t)>-1);return this.rand_pos.push(t),t},get_random_rgb:function(){var t,e,s,i;do{t=parseInt(255*Math.random()),e=parseInt(255*Math.random()),s=parseInt(255*Math.random()),i="rgb("+t+", "+e+", "+s+")"}while(this.rand_RGB.indexOf(i)>-1);return this.rand_RGB.push(i),i},update_target:function(t){if(this.targets.length>0){var e,s,i,a=this.targets.length,o=t.length;for(e=0;e<a;e++)for(i=r.gx(this.targets[e]),s=0;s<o;s++)i.css("background-image",t[s])}},apply_style:function(t,e){var s="linear";if("linear"!=r.type&&(s="radial"),e.indexOf(this.direction)>-1)var i=["-webkit-"+s+"-gradient("+e+")","-moz-"+s+"-gradient("+e+")","-ms-"+s+"-gradient("+e+")","-o-"+s+"-gradient("+e+")",s+"-gradient("+e+")"];else i=[e];for(var a=i.length,o="";a>0;)a--,t.css("background",i[a]),o+="background: "+i[a]+";\n";this.change(this.sliders,i),this.update_target(i),r.gx("#gradx_code").html(o)},apply_default_styles:function(){this.update_style_array();var t=this.get_style_value();this.apply_style(this.panel,t)},update_style_array:function(){this.sliders=[];var t,e,s,i,a=r.slider_ids.length;for(t=0;t<a;t++)i="#"+r.slider_ids[t],e=parseInt(r.gx(i).css("left")),s=parseInt(e/r.container_width*100),s-=6,r.sliders.push([r.gx(i).css("background-color"),s]);this.sliders.sort(function(t,e){return t[1]>e[1]?1:-1})},get_style_value:function(){var t=r.slider_ids.length;if(1===t)e=this.sliders[0][0];else{for(var e="",s="",i=0;i<t;i++)""==this.sliders[i][1]?e+=s+this.sliders[i][0]:(this.sliders[i][1]>100&&(this.sliders[i][1]=100),e+=s+(this.sliders[i][0]+" ")+this.sliders[i][1]+"%"),s=" , ";e="linear"==this.type?this.direction+" , "+e:this.direction+" , "+this.type+" "+this.shape+" , "+e}return e},get_rgb_obj:function(t){return t=(t=(t=t.split("("))[1]).split(","),{r:parseInt(t[0]),g:parseInt(t[1]),b:parseInt(t[2])}},load_info:function(t){var e="#"+t.id;if(this.current_slider_id=e,this.slider_ids.indexOf(t.id)>-1){var s=r.gx(e).css("backgroundColor"),i=this.get_rgb_obj(s),a=r.gx(e).css("left");parseInt(a)>26&&parseInt(a)<426&&r.gx("#gradx_slider_info").css("left",a).show(),this.set_colorpicker(i),console.log(i)}},add_slider:function(t){var e,s,i,a;0===t.length&&(t=[{color:r.get_random_rgb(),position:r.get_random_position()},{color:r.get_random_rgb(),position:r.get_random_position()}]);var o=t;for(i in o){if(void 0===o[i].position)break;var n=26;a=parseInt(o[i].position*this.container_width/100)+n+"px",e="gradx_slider_"+this.slider_index,this.sliders.push([o[i].color,o[i].position]),this.slider_ids.push(e),s="<div class='gradx_slider' id='"+e+"'></div>",r.gx("#gradx_start_sliders_"+this.id).append(s),r.gx("#"+e).css("backgroundColor",o[i].color).css("left",a),this.slider_index++}for(var l=0,d=this.slider_ids.length;l<d;l++)r.gx("#"+this.slider_ids[l]).draggable({containment:"parent",axis:"x",start:function(){r.jQ_present&&(r.current_slider_id="#"+r.gx(this).attr("id"))},drag:function(){r.update_style_array(),r.apply_style(r.panel,r.get_style_value());var t=r.gx(r.current_slider_id).css("left");parseInt(t)>26&&parseInt(t)<426&&r.gx("#gradx_slider_info").css("left",t).show();var e=r.gx(r.current_slider_id).css("backgroundColor"),s=r.get_rgb_obj(e);r.cp.colorer().set(s)}}).click(function(){return r.load_info(this),!1})},set_colorpicker:function(t){r.cp.colorer({picked:function(t,e){if(0!=r.current_slider_id){var s=e.toRgbString();r.gx(r.current_slider_id).css("background-color",s),r.update_style_array(),r.apply_style(r.panel,r.get_style_value())}},choosed:function(t){r.gx("#gradx_slider_info").hide()},canceled:function(t){r.gx("#gradx_slider_info").hide()},flat:!0,showAlpha:!0,color:t,clickoutFiresChange:!0,showInput:!0,showButtons:!1})},generate_options:function(t){for(var e,s,i=t.length,r="",a=0;a<i;a++)e=(e=t[a].split(" "))[0],s=a<2?e[1]:"",e=e.replace("-"," "),r+="<option value="+t[a]+" "+s+">"+e+"</option>";return r},generate_radial_options:function(){var t;t=["horizontal-center disabled","center selected","left","right"],r.gx("#gradx_gradient_subtype").html(r.generate_options(t)),t=["vertical-center disabled","center selected","top","bottom"],r.gx("#gradx_gradient_subtype2").html(r.generate_options(t)).show()},generate_linear_options:function(){var t;t=["horizontal-center disabled","left selected","right","top","bottom"],r.gx("#gradx_gradient_subtype").html(r.generate_options(t)),r.gx("#gradx_gradient_subtype2").hide()},destroy:function(){var t={targets:[],sliders:[],direction:"left",type:"linear",code_shown:!1,change:function(t,e){}};for(var e in t)r[e]=t[e]},load_gradx:function(t,e){this.me=r.gx(t),this.id=t.replace("#",""),t=this.id,this.current_slider_id=!1;var s="<div class='gradx'>\n<div id='gradx_add_slider' class='gradx_add_slider gradx_btn'><i class='icon icon-add'></i>add</div>\n<div class='gradx_slectboxes'>\n<select id='gradx_gradient_type' class='gradx_gradient_type'>\n    <option value='linear'>Linear</option>\n    <option value='circle'>Radial - Circle</option>\n    <option value='ellipse'>Radial - Ellipse</option>\n</select>\n<select id='gradx_gradient_subtype' class='gradx_gradient_type'>\n    <option id='gradx_gradient_subtype_desc' value='gradient-direction' disabled>gradient direction</option>\n    <option value='left' selected>Left</option>\n    <option value='right'>Right</option>\n    <option value='top'>Top</option>\n    <option value='bottom'>Bottom</option>\n</select>\n<select id='gradx_gradient_subtype2' class='gradx_gradient_type gradx_hide'>\n</select>\n<select id='gradx_radial_gradient_size' class='gradx_gradient_type gradx_hide'>\n</select>\n</div>\n<div class='gradx_container' id='gradx_"+t+"'>\n    <div id='gradx_stop_sliders_"+t+"'></div>\n    <div class='gradx_panel' id='gradx_panel_"+t+"'></div>\n    <div class='gradx_start_sliders' id='gradx_start_sliders_"+t+"'>\n        <div class='cp-default' id='gradx_slider_info'>\n            <div id='gradx_slider_controls'>\n                <div id='gradx_delete_slider' class='gradx_btn'><i class='icon icon-remove'></i>delete</div>\n            </div>\n            <div id='gradx_slider_content'></div>\n        </div> \n    </div>\n</div>\n<div id='gradx_show_code' class='gradx_show_code gradx_btn'><i class='icon icon-file-css'></i><span>show the code</span></div>\n<div id='gradx_show_presets' style='display:none' class='gradx_show_presets gradx_btn'><i class='icon icon-preset'></i><span>show presets</span></div>\n<textarea class='gradx_code' id='gradx_code'></textarea>\n</div>";this.me.html(s);var i="";if(i=r.generate_options(["gradient-size disabled","closest-side selected","closest-corner","farthest-side","farthest-corner","contain","cover"]),r.gx("#gradx_radial_gradient_size").html(i),this.container=r.gx("#gradx_"+t),this.panel=r.gx("#gradx_panel_"+t),this.container_width=400,this.add_slider(e),r.add_event(document,"click",function(){if(!r.slider_hovered[t])return r.gx("#gradx_slider_info").hide(),!1}),r.gx("#gradx_add_slider").click(function(){r.add_slider([{color:r.get_random_rgb(),position:r.get_random_position()}]),r.update_style_array(),r.apply_style(r.panel,r.get_style_value())}),r.cp=r.gx("#gradx_slider_content"),r.set_colorpicker("blue"),r.gx("#gradx_delete_slider").click(function(){r.gx(r.current_slider_id).remove(),r.gx("#gradx_slider_info").hide();for(var t=r.current_slider_id.replace("#",""),e=0;e<r.slider_ids.length;e++)r.slider_ids[e]==t&&r.slider_ids.splice(e,1);r.update_style_array(),r.apply_style(r.panel,r.get_style_value()),r.current_slider_id=!1}),r.gx("#gradx_code").focus(function(){var t=r.gx(this);t.select(),t.mouseup(function(){return t.off("mouseup"),!1})}),r.gx("#gradx_gradient_type").change(function(){var t=r.gx(this).val();"linear"!==t?r.generate_radial_options():(r.generate_linear_options(),r.gx("#gradx_gradient_subtype").val("left")),r.type=t,r.direction=r.gx("#gradx_gradient_subtype").val(),r.apply_style(r.panel,r.get_style_value())}),"linear"!==this.type){var a;if(r.gx("#gradx_gradient_type").val(this.type),r.generate_radial_options(),"left"!==this.direction)a=this.direction.indexOf(",")>-1?this.direction.split(","):this.direction.split(" "),o=a[0],n=a[1],r.gx("#gradx_gradient_subtype").val(o),r.gx("#gradx_gradient_subtype2").val(n);else var o=r.gx("#gradx_gradient_subtype").val(),n=r.gx("#gradx_gradient_subtype2").val();r.direction=o+" "+n,r.apply_style(r.panel,r.get_style_value())}else"left"!==this.direction&&r.gx("#gradx_gradient_subtype").val(this.direction);r.gx("#gradx_gradient_subtype").change(function(){if("linear"===r.type)r.direction=r.gx(this).val();else{var t=r.gx(this).val(),e=r.gx("#gradx_gradient_subtype2").val();r.direction=t+" "+e}r.apply_style(r.panel,r.get_style_value())}),r.gx("#gradx_gradient_subtype2").change(function(){var t=r.gx("#gradx_gradient_subtype").val(),e=r.gx(this).val();r.direction=t+" "+e,r.apply_style(r.panel,r.get_style_value())}),r.gx("#gradx_radial_gradient_size").change(function(){r.shape=r.gx(this).val(),r.apply_style(r.panel,r.get_style_value())}),r.gx("#gradx_show_code").click(function(){r.code_shown?(r.code_shown=!1,r.gx("#gradx_show_code span").text("show the code"),r.gx("#gradx_code").hide()):(r.gx("#gradx_show_code span").text("hide the code"),r.gx("#gradx_code").show(),r.code_shown=!0)}),r.code_shown&&(r.gx("#gradx_show_code span").text("hide the code"),r.gx("#gradx_code").show()),r.add_event(document.getElementById("gradx_slider_info"),"mouseout",function(){r.slider_hovered[t]=!1}),r.add_event(document.getElementById("gradx_slider_info"),"mouseover",function(){r.slider_hovered[t]=!0})}};for(var o in r.load_jQ(),t.mixin(i,s),i)r[o]=i[o];r.load_gradx(e,r.sliders),r.apply_default_styles()}}),t("skylark-domx-plugins-colors/main",["skylark-domx-query","./colors","./colorer","./ColorPalette","./ColorPicker","./ColorPane","./Gradienter"],function(t,e,s){return e}),t("skylark-domx-plugins-colors",["skylark-domx-plugins-colors/main"],function(t){return t})}(s),!i){var o=require("skylark-langx-ns");r?module.exports=o:e.skylarkjs=o}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-colors.js.map
