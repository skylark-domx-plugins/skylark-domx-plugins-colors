/**
 * skylark-domx-plugins-colors - The skylark color plugin library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-domx-plugins/skylark-domx-plugins-colors/
 * @license MIT
 */
define(["skylark-domx-browser","skylark-domx-query","skylark-graphics-colors/color"],function(t,r,s){t.isIE;return{paletteTemplate:function(t,a,e,l){for(var o=[],n=0;n<t.length;n++){var p=t[n];if(p){var c=s.parse(p),i=c.toHsl().l<.5?"sp-thumb-el sp-thumb-dark":"sp-thumb-el sp-thumb-light";i+=s.equals(a,p)?" sp-thumb-active":"";var u=c.toString(l.preferredFormat||"rgb"),d="background-color:"+c.toRgbString();o.push('<span title="'+u+'" data-color="'+c.toRgbString()+'" class="'+i+'"><span class="sp-thumb-inner" style="'+d+';" /></span>')}else o.push(r("<div />").append(r('<span data-color="" style="background-color:transparent;" class="sp-clear-display"></span>').attr("title",l.texts.noColorSelectedText)).html())}return"<div class='sp-cf "+e+"'>"+o.join("")+"</div>"}}});
//# sourceMappingURL=sourcemaps/helper.js.map
