/**
 * skylark-domx-plugins-colors - The skylark color plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-colors/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-noder","skylark-domx-eventer","skylark-domx-finder","skylark-domx-query","skylark-domx-plugins-base"],function(t,i,s,o,n,a,e,h){var r=h.Plugin.inherit({klassName:"Indicator",pluginName:"lark.colors.indicator",options:{},_construct:function(t,i){h.Plugin.prototype._construct.call(this,t,i),this.listenTo(this.elmx(),"mousedown",t=>{this._start(t)})},_move:function(t){if(this._dragging){var i=this._offset,s=t.pageX,o=t.pageY,n=this._maxWidth,a=this._maxHeight,e=Math.max(0,Math.min(s-i.left,n)),h=Math.max(0,Math.min(o-i.top,a)),r=this.options.onmove;r&&r.apply(this._elm,[e,h,t])}},_start:function(t){if(!(t.which?3==t.which:2==t.button)&&!this._dragging){var i=this.options.onstart;if(!i||!1!==i.apply(this._elm,arguments)){this._dragging=!0;var s=this.$();this._maxHeight=s.height(),this._maxWidth=s.width(),this._offset=s.offset();var o=this.$(document);this.listenTo(o,{mousemove:t=>{this._move(t)},mouseup:t=>{this._stop(t)}}),o.find("body").addClass("sp-dragging"),this._move(t),n.stop(t)}}},_stop:function(t){var i=this.$(document);this._dragging&&(this.unlistenTo(i),i.find("body").removeClass("sp-dragging"),onstop=this.options.onstop,onstop&&this._delay(function(){onstop.apply(this._elm,arguments)})),this._dragging=!1}});return h.register(r),r});
//# sourceMappingURL=sourcemaps/indicator.js.map
