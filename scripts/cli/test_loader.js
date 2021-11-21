/// <reference path="../../../node_modules/@types/node/index.d.ts" />
/// <reference path="../../../node_modules/@types/xmldom/index.d.ts" />
/// <reference path="../../../node_modules/@types/jquery/index.d.ts" />
define(["require", "exports", "../core/core", "../graphs/all"], function (require, exports, core_1, all_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require('source-map-support').install();
    var xmldom = require("xmldom");
    all_1.registerAllGraphTypes();
    // OMFG...
    // http://stackoverflow.com/a/13411244
    var content = '';
    process.stdin.resume();
    process.stdin.on('data', function (buf) { content += buf.toString(); });
    process.stdin.on('end', function () {
        var graph = core_1.loadGraphFromString(content);
        console.log(graph);
    });
});
//# sourceMappingURL=test_loader.js.map