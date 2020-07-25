define([
	"skylark-domx-query",
	"./colors",
    "./colorer",
    "./ColorPalette",
    "./ColorPicker",
    "./ColorPane",
    "./i18n/texts_ja",
    "./i18n/texts_zh-cn",
    "./i18n/texts_zh-tw"
], function($,colors,colorer) {
   
   $.fn.colorer = $.wraps.wrapper_every_act(colorer,colors);

   return colors;

});
