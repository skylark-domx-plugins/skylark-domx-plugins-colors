define([
    "skylark-domx-browser",
    "skylark-domx-query",
    "skylark-graphics-color/Color"    
],function(browser,$,Color){
    function paletteElementClick(e) {
        if (e.data && e.data.ignore) {
            self.set($(e.target).closest(".sp-thumb-el").data("color"));
            move();
        }
        else {
            self.set($(e.target).closest(".sp-thumb-el").data("color"));
            move();

            // If the picker is going to close immediately, a palette selection
            // is a change.  Otherwise, it's a move only.
            if (opts.hideAfterPaletteSelect) {
                self_updateOriginalInput(true);
                self.hide();
            } else {
                self._updateOriginalInput();
            }
        }

        return false;
    }

    var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";	

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = Color.parse(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (Color.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = "background-color:" + tiny.toRgbString();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.texts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    return {
    	paletteTemplate
    }
});
