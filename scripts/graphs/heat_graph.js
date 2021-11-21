/// <reference path="heat_types.ts" />
/// <reference path="heat_dirichlet.ts" />
/// <reference path="heat_cell.ts" />
define(["require", "exports", "../core/core", "./heat_types", "./heat_dirichlet", "./heat_cell"], function (require, exports, POETS, heat_types_1, heat_dirichlet_1, heat_cell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert = POETS.assert;
    var GraphType = POETS.GraphType;
    var GenericTypedDataSpec = POETS.GenericTypedDataSpec;
    exports.heatGraphType = new GraphType("gals_heat", new GenericTypedDataSpec(heat_types_1.HeatGraphProperties, heat_types_1.HeatGraphProperties.elements), [
        heat_dirichlet_1.dirichletDeviceType,
        heat_cell_1.cellDeviceType
    ]);
    function makeGrid(width, height) {
        var h = Math.sqrt(1.0 / (width * height));
        var alpha = 1;
        var dt = h * h / (4 * alpha) * 0.5;
        //let dt=0.05;
        assert(h * h / (4 * alpha) >= dt);
        var wOther = dt * alpha / (h * h);
        var wSelf = (1.0 - 4 * wOther);
        var g = new POETS.GraphInstance(exports.heatGraphType, "heat_rect_" + width + "_" + height, { maxTime: 1000000 });
        var makeVoronoiCell = function (x, y) {
            var res = [[x - 0.5, y - 0.5], [x - 0.5, y + 0.5], [x + 0.5, y + 0.5], [x + 0.5, y - 0.5]];
            return res;
        };
        for (var y = 0; y < width; y++) {
            var T = y == 0;
            var B = y == height - 1;
            var H = T || B;
            for (var x = 0; x < height; x++) {
                var L = x == 0;
                var R = x == width - 1;
                var V = L || R;
                if (H && V)
                    continue;
                var id = "d_" + x + "_" + y;
                var voronoi = makeVoronoiCell(x, y);
                if (x == Math.floor(width / 2) && y == Math.floor(height / 2)) {
                    var props = { "dt": 1, "bias": 0, "amplitude": 1.0, "phase": 1.5, "frequency": 100 * dt, "neighbours": 4 };
                    g.addDevice(id, heat_dirichlet_1.dirichletDeviceType, props, { x: x, y: y, voronoi: voronoi });
                }
                else if (H || V) {
                    var props = { "dt": 1, "bias": 0, "amplitude": 1.0, "phase": 1, "frequency": 70 * dt * ((x / width) + (y / height)), "neighbours": 1 };
                    g.addDevice(id, heat_dirichlet_1.dirichletDeviceType, props, { x: x, y: y });
                }
                else {
                    var props = { "dt": 1, nhood: 4, wSelf: wSelf, iv: Math.random() * 2 - 1 };
                    g.addDevice(id, heat_cell_1.cellDeviceType, props, { x: x, y: y });
                }
            }
        }
        for (var y = 0; y < width; y++) {
            var T = y == 0;
            var B = y == height - 1;
            var H = T || B;
            var _loop_1 = function () {
                var L = x == 0;
                var R = x == width - 1;
                var V = L || R;
                if (H && V)
                    return "continue";
                var id = "d_" + x + "_" + y;
                addEdge = function (dstX, dstY) {
                    var buddy = id + ":in-d_" + dstX + "_" + dstY + ":out";
                    g.addEdge("d_" + dstX + "_" + dstY, "in", id, "out", { w: wOther }, { buddy: buddy });
                };
                if (L) {
                    addEdge(x + 1, y);
                }
                else if (R) {
                    addEdge(x - 1, y);
                }
                else if (T) {
                    addEdge(x, y + 1);
                }
                else if (B) {
                    addEdge(x, y - 1);
                }
                else {
                    addEdge(x - 1, y);
                    addEdge(x + 1, y);
                    addEdge(x, y - 1);
                    addEdge(x, y + 1);
                }
            };
            var addEdge;
            for (var x = 0; x < height; x++) {
                _loop_1();
            }
        }
        return g;
    }
    exports.makeGrid = makeGrid;
    function makeGridHex(width, height) {
        if ((width % 2) == 0)
            width++;
        if ((height % 2) == 0)
            height++;
        var h = Math.sqrt(1.0 / (width * height));
        var alpha = 1;
        var dt = h * h / (6 * alpha) * 0.5;
        //let dt=0.05;
        assert(h * h / (6 * alpha) >= dt);
        var wOther = dt * alpha / (h * h);
        var d = Math.sqrt(3.0) / 4.0;
        var g = new POETS.GraphInstance(exports.heatGraphType, "heat_hex_" + width + "_" + height, { maxTime: 1000000 });
        /* We place hexagons at points as follows:
    
                                |     |
                                +--1--+
                                |     |
    
            +---+       +---+       +---+         -+----+-
           /     \     /     \     /     \         d    |
          +  0,0  +---+  2,0  +---+  4,0  +       -+-  2*d
           \     /     \     /     \     /              |
            +---+  1,1  +---+  3,1  +---+              -+-
           /     \     /     \     /     \
          +  0,2  +---+  2,2  +---+  4,2  +
           \     /     \     /     \     /
            +---+       +---+       +---+
    
                +
               /|\
          0.5 / |d\
             /  |  \
            +---+---+
            0.25  0.25
    
            d=sqrt(3)/4
    
            So even y co-ordinates have hexagons at even x co-ords,
            and odd y at odd y. Equivalently, hexagons appear when
            the sum of co-ordinates is even.
    
            The world location is:
                (1+x,(1+y)*d)
    
            
        */
        var makeVoronoiCell = function (x, y) {
            var res = [[x - 0.5, y], [x - 0.25, y + d], [x + 0.25, y + d], [x + 0.5, y], [x + 0.25, y - d], [x - 0.25, y - d]];
            return res;
        };
        var isGap = function (x, y) {
            var ox = ((x + 0.5) / width - 0.5) * 2;
            var oy = ((y + 0.5) / height - 0.5) * 2;
            return Math.sqrt(ox * ox + oy * oy) < 0.4;
        };
        var makeNhood = function (x, y) {
            var nhood = [[x - 1, y - 1], [x, y + 2], [x - 1, y + 1], [x + 1, y + 1], [x, y - 2], [x + 1, y - 1]];
            nhood = nhood.filter(function (v) { return (v[0] >= 0) && (v[0] < width) && (v[1] >= 0) && (v[1] < height); });
            nhood = nhood.filter(function (v) { return !isGap(v[0], v[1]); });
            return nhood;
        };
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                if (((x + y) % 2) != 0) {
                    continue;
                }
                if (isGap(x, y)) {
                    continue;
                }
                var nhood = makeNhood(x, y);
                var id = "d_" + x + "_" + y;
                var nhoodSize = nhood.length;
                var isDirichlet = (x == 0 || x == width - 1);
                var voronoi = makeVoronoiCell(x, y);
                var wSelf = (1.0 - nhoodSize * wOther);
                var px = 1.0 + x;
                var py = (1.0 + y) * d;
                console.log(id);
                var dev;
                if (isDirichlet) {
                    var props = { "bias": 0, "amplitude": 1.0, "phase": 1, "frequency": 70 * dt * ((x / width) + (y / height)), "neighbours": nhoodSize };
                    g.addDevice(id, heat_dirichlet_1.dirichletDeviceType, props, { x: px, y: py, voronoi: voronoi });
                }
                else {
                    var props = { nhood: nhoodSize, wSelf: wSelf, iv: Math.random() * 2 - 1 };
                    g.addDevice(id, heat_cell_1.cellDeviceType, props, { x: px, y: py, voronoi: voronoi });
                }
            }
        }
        for (var x = 0; x < width; x++) {
            var _loop_2 = function (y) {
                if (((x + y) % 2) != 0) {
                    return "continue";
                }
                if (isGap(x, y)) {
                    return "continue";
                }
                nhood = makeNhood(x, y);
                console.log(x + "," + y + " -> " + nhood);
                var id = "d_" + x + "_" + y;
                var nhoodSize = nhood.length;
                var isDirichlet = (x == 0 || x == width - 1 || y == 0 || y == height - 1);
                addEdge = function (dstX, dstY) {
                    assert(dstX >= 0);
                    assert(dstX < width);
                    assert(dstY >= 0);
                    assert(dstY < height);
                    var buddy = id + ":in-d_" + dstX + "_" + dstY + ":out";
                    g.addEdge("d_" + dstX + "_" + dstY, "in", id, "out", { w: wOther }, { buddy: buddy });
                };
                for (var _i = 0, nhood_1 = nhood; _i < nhood_1.length; _i++) {
                    var _a = nhood_1[_i], sx = _a[0], sy = _a[1];
                    addEdge(sx, sy);
                }
            };
            var nhood, addEdge;
            for (var y = 0; y < height; y++) {
                _loop_2(y);
            }
        }
        return g;
    }
    exports.makeGridHex = makeGridHex;
});
//# sourceMappingURL=heat_graph.js.map