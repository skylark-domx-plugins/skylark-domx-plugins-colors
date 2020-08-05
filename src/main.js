define([
	"skylark-domx-query",
	"./colors",
    "./colorer",
    "./ColorPalette",
    "./ColorPicker",
    "./ColorPane"
], function($,colors,colorer) {
   
   $.fn.colorer = $.wraps.wrapper_every_act(colorer,colors);

   return colors;

});
