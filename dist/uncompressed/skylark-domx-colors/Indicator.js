define([
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-plugins"    
],function(skylark, langx, browser, noder, eventer,finder, $,plugins) {
    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (browser.isIE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            var onstart = this.options.onstart || funcs.noop;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).on(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).off(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).on("touchstart mousedown", start);
    }
	

    var Indicator = plugins.Plugin.inherit({
        klassName : "Indicator",

        pluginName : "domx.indicator",

        options : {
        },

        _construct: function(elm, options) {
            plugins.Plugin.prototype._construct.call(this,elm,options);

            this.listenTo(this.elmx(),"mousedown" , (e) => {
                this._start(e);
            });

        },

        _move : function(e) {
            if (this._dragging) {
                var offset = this._offset,
                    pageX = e.pageX,
                    pageY = e.pageY,
                    maxWidth = this._maxWidth,
                    maxHeight = this._maxHeight;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                var onmove = this.options.onmove;
                if (onmove) {
                    onmove.apply(this._elm, [dragX, dragY, e]);
                }
            }
        },

        _start : function(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !this._dragging) {
                var onstart = this.options.onstart;
                if (!onstart || onstart.apply(this._elm, arguments) !== false) {
                    this._dragging = true;
                    var $el = this.$();

                    this._maxHeight = $el.height();
                    this._maxWidth = $el.width();
                    this._offset = $el.offset();

                    var $doc = this.$(document)

                    this.listenTo($doc,{
                        "mousemove" : (e) => {
                            this._move(e);
                        },
                        "mouseup" : (e) => {
                            this._stop(e);
                        }                
                    });
                    $doc.find("body").addClass("sp-dragging");

                    this._move(e);

                    eventer.stop(e);
                }
            }
        },

        _stop : function(e) {
            var $doc = this.$(document);
            if (this._dragging) {
                this.unlistenTo($doc);
                $doc.find("body").removeClass("sp-dragging");

                onstop = this.options.onstop;

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                if (onstop) {
                    this._delay(function() {
                        onstop.apply(this._elm, arguments);
                    });
                }
            }
            this._dragging = false;            
        }
    });

    plugins.register(Indicator);

	return Indicator;
});