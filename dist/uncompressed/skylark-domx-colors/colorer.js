define([
	"./colors",
	"./ColorPane"
],function(colors,ColorPane){
	function colorer(elmInput,options) {
		return new ColorPane(elmInput,options);
	}

	return colors.colorer = colorer;
});