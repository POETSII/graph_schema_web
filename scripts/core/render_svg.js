define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RenderSVG = /** @class */ (function () {
        function RenderSVG(graph, container) {
            this.graph = graph;
            this.container = container;
            this._devToSvg = {};
            this.drawing = SVG(container);
            var diameter = 5;
            for (var _i = 0, _a = graph.enumDevices(); _i < _a.length; _i++) {
                var d = _a[_i];
                var meta = d.metadata;
                var x = meta["x"];
                var y = meta["y"];
                var n = this.drawing.circle(diameter);
                n.move(x * 10 + 70, y * 10 + 70);
                this._devToSvg[d.id] = n;
            }
            this.drawing.scale(2, 2);
        }
        return RenderSVG;
    }());
    exports.RenderSVG = RenderSVG;
    ;
});
//# sourceMappingURL=render_svg.js.map