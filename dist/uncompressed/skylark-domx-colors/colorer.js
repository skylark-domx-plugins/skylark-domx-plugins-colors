define([
    "skylark-langx/langx",
    "skylark-domx-query",
	"./colors",
	"./ColorBox",
	"./ColorPane"
],function(langx,$,colors,ColorBox,ColorPane){
   var pickers = [],
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    
    markup = (function () {
        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();


	function colorer(elmInput,options) {
		options = langx.mixin({
            // Options
            color: false,
            flat: false,
            appendTo: "body",
            maxSelectionSize: 7,
            preferredFormat: false,
            containerClassName: "",
            replacerClassName: "",
            theme: "sp-light",

            offset: null
		},options);

		var 
			theme = options.theme,
			flat = options.flat,
			appendTo = options.appendTo,
			$el = $(elmInput),
			$pane = $(markup,elmInput.ownerDocument).addClass(theme),
	        isInput = $el.is("input"),
	        isInputTypeColor = isInput && $el.attr("type") === "color",
	        shouldReplace = this._shouldReplace =  isInput && !flat,
	        $replacer =  (shouldReplace) ? $(replaceInput).addClass(theme)
	                                                      .addClass(options.className)
	                                                      .addClass(options.replacerClassName) 
	                                     : $([]),
	        $offsetElement =  (shouldReplace) ? $replacer : $el;


        delete options.flat;
        delete options.appendTo;

        options.color = options.color || (isInput && $el.val());

        if (shouldReplace) {
            $el.after($replacer).hide();
        }


        $pane.toggleClass("sp-flat", flat)
             .addClass(options.containerClassName);

        if (flat) {
            $el.after($pane).hide();
            var pane = new ColorPane($pane[0],options);
            pane.show();
            return pane;
        } else {
            var $appendTo = appendTo === "parent" ? $el.parent() : $(appendTo);
            if ($appendTo.length !== 1) {
                $appendTo = $("body");
            }

            $appendTo.append($pane);
            options.pane = $pane;
            return new ColorBox($replacer[0],options);
        }
	}

	return colors.colorer = colorer;
});